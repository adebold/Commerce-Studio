/**
 * Socket.IO handler for real-time consultation
 */
const { v4: uuidv4 } = require('uuid');

module.exports = (io, consultationService, logger) => {
  io.on('connection', (socket) => {
    logger.info('Client connected to consultation socket', {
      socketId: socket.id,
      ip: socket.request.connection.remoteAddress
    });

    // Handle consultation join
    socket.on('join_consultation', async (data) => {
      try {
        const { consultationId, tenantId, userId, language } = data;
        
        // Validate consultation exists
        const consultation = consultationService.activeConsultations.get(consultationId);
        if (!consultation) {
          socket.emit('error', {
            code: 'CONSULTATION_NOT_FOUND',
            message: 'Consultation not found'
          });
          return;
        }
        
        // Validate user authorization
        if (consultation.tenantId !== tenantId || consultation.userId !== userId) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized access to consultation'
          });
          return;
        }
        
        // Join consultation room
        socket.join(consultationId);
        socket.consultationId = consultationId;
        socket.tenantId = tenantId;
        socket.userId = userId;
        socket.language = language || consultation.language;
        
        // Send welcome message
        socket.emit('joined_consultation', {
          consultationId,
          language: socket.language,
          status: consultation.status,
          welcomeMessage: consultation.welcomeMessage
        });
        
        logger.info('Client joined consultation', {
          socketId: socket.id,
          consultationId,
          tenantId,
          userId,
          language: socket.language
        });
        
      } catch (error) {
        logger.error('Error joining consultation', {
          error: error.message,
          socketId: socket.id,
          data
        });
        
        socket.emit('error', {
          code: 'JOIN_ERROR',
          message: 'Failed to join consultation'
        });
      }
    });

    // Handle real-time message
    socket.on('send_message', async (data) => {
      try {
        const { message, metadata } = data;
        
        if (!socket.consultationId) {
          socket.emit('error', {
            code: 'NOT_JOINED',
            message: 'Must join consultation first'
          });
          return;
        }
        
        // Process message through consultation service
        const result = await consultationService.processMessage(
          socket.consultationId,
          message,
          { 
            metadata: {
              ...metadata,
              source: 'websocket',
              socketId: socket.id
            }
          }
        );
        
        // Send response back to client
        socket.emit('message_response', {
          messageId: uuidv4(),
          response: result.response,
          timestamp: new Date().toISOString(),
          language: socket.language
        });
        
        // Broadcast to other clients in same consultation (if any)
        socket.to(socket.consultationId).emit('consultation_activity', {
          type: 'message_sent',
          consultationId: socket.consultationId,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        logger.error('Error processing message', {
          error: error.message,
          socketId: socket.id,
          consultationId: socket.consultationId
        });
        
        socket.emit('error', {
          code: 'MESSAGE_ERROR',
          message: 'Failed to process message'
        });
      }
    });

    // Handle image upload
    socket.on('upload_image', async (data) => {
      try {
        const { imageData, format, quality } = data;
        
        if (!socket.consultationId) {
          socket.emit('error', {
            code: 'NOT_JOINED',
            message: 'Must join consultation first'
          });
          return;
        }
        
        // Validate image data
        if (!imageData || !imageData.startsWith('data:image/')) {
          socket.emit('error', {
            code: 'INVALID_IMAGE',
            message: 'Invalid image data'
          });
          return;
        }
        
        const message = {
          type: 'image',
          imageData,
          format,
          quality
        };
        
        // Show processing indicator
        socket.emit('processing_image', {
          message: 'Analyzing your image...',
          language: socket.language
        });
        
        // Process image through consultation service
        const result = await consultationService.processMessage(
          socket.consultationId,
          message,
          { 
            metadata: {
              source: 'websocket_upload',
              socketId: socket.id
            }
          }
        );
        
        // Send analysis result
        socket.emit('image_analysis_result', {
          messageId: uuidv4(),
          response: result.response,
          timestamp: new Date().toISOString(),
          language: socket.language
        });
        
      } catch (error) {
        logger.error('Error processing image', {
          error: error.message,
          socketId: socket.id,
          consultationId: socket.consultationId
        });
        
        socket.emit('error', {
          code: 'IMAGE_ERROR',
          message: 'Failed to process image'
        });
      }
    });

    // Handle language switch
    socket.on('switch_language', async (data) => {
      try {
        const { language } = data;
        
        if (!socket.consultationId) {
          socket.emit('error', {
            code: 'NOT_JOINED',
            message: 'Must join consultation first'
          });
          return;
        }
        
        // Switch language in consultation service
        const result = await consultationService.switchLanguage(
          socket.consultationId,
          language
        );
        
        // Update socket language
        socket.language = language;
        
        // Confirm language switch
        socket.emit('language_switched', {
          consultationId: socket.consultationId,
          newLanguage: language,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        logger.error('Error switching language', {
          error: error.message,
          socketId: socket.id,
          consultationId: socket.consultationId
        });
        
        socket.emit('error', {
          code: 'LANGUAGE_ERROR',
          message: 'Failed to switch language'
        });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', () => {
      if (socket.consultationId) {
        socket.to(socket.consultationId).emit('user_typing', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('typing_stop', () => {
      if (socket.consultationId) {
        socket.to(socket.consultationId).emit('user_stopped_typing', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle consultation end
    socket.on('end_consultation', async () => {
      try {
        if (!socket.consultationId) {
          socket.emit('error', {
            code: 'NOT_JOINED',
            message: 'Must join consultation first'
          });
          return;
        }
        
        // End consultation through service
        const result = await consultationService.endConsultation(socket.consultationId);
        
        // Notify client
        socket.emit('consultation_ended', {
          consultationId: socket.consultationId,
          summary: result.summary,
          timestamp: new Date().toISOString()
        });
        
        // Leave room
        socket.leave(socket.consultationId);
        
        logger.info('Consultation ended via socket', {
          socketId: socket.id,
          consultationId: socket.consultationId
        });
        
      } catch (error) {
        logger.error('Error ending consultation', {
          error: error.message,
          socketId: socket.id,
          consultationId: socket.consultationId
        });
        
        socket.emit('error', {
          code: 'END_ERROR',
          message: 'Failed to end consultation'
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected from consultation', {
        socketId: socket.id,
        consultationId: socket.consultationId,
        reason
      });
      
      // Notify other clients if in a consultation
      if (socket.consultationId) {
        socket.to(socket.consultationId).emit('user_disconnected', {
          userId: socket.userId,
          timestamp: new Date().toISOString(),
          reason
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', {
        error: error.message,
        socketId: socket.id,
        consultationId: socket.consultationId
      });
    });
  });

  // Handle server-side events
  io.engine.on('connection_error', (err) => {
    logger.error('Socket connection error', {
      error: err.message,
      code: err.code,
      context: err.context
    });
  });

  logger.info('Socket.IO consultation handler initialized');
};