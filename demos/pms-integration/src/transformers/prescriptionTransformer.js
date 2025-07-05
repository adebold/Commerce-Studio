/**
 * Prescription Transformer
 * Converts Apollo prescription data format to eyewear-ML format
 * and handles the notation differences between European and US standards
 */
const logger = require('../utils/logger');

class PrescriptionTransformer {
  /**
   * Transform Apollo prescription to eyewear-ML format
   * This includes converting from positive cylinder (European) to negative cylinder (US) notation
   * 
   * @param {Object} apolloPrescription - Prescription data from Apollo API
   * @returns {Object} - Transformed prescription in eyewear-ML format
   */
  static transform(apolloPrescription) {
    try {
      logger.debug('Transforming prescription', { id: apolloPrescription.id });
      
      // Extract basic prescription details
      const transformedPrescription = {
        id: apolloPrescription.id,
        externalId: `apollo_${apolloPrescription.id}`,
        patientId: apolloPrescription.patientId,
        prescriberId: apolloPrescription.doctorId,
        prescriptionDate: apolloPrescription.date,
        expirationDate: apolloPrescription.expirationDate,
        notes: apolloPrescription.notes || '',
        
        // Transform eye measurements
        rightEye: this.transformEyeMeasurements('right', apolloPrescription.rightEye),
        leftEye: this.transformEyeMeasurements('left', apolloPrescription.leftEye),
        
        // Additional measurements
        pd: this.extractPD(apolloPrescription),
        
        // Metadata
        source: 'Apollo',
        updatedAt: new Date().toISOString()
      };
      
      // Extract add power if available (for bifocals/progressives)
      if (apolloPrescription.addPower) {
        transformedPrescription.addPower = this.parseAddPower(apolloPrescription.addPower);
      }
      
      // Add any additional special fields found in comments
      const additionalFields = this.extractAdditionalFields(apolloPrescription.comments || '');
      Object.assign(transformedPrescription, additionalFields);
      
      logger.debug('Prescription transformation complete', { id: apolloPrescription.id });
      return transformedPrescription;
    } catch (error) {
      logger.error(`Error transforming prescription ${apolloPrescription?.id}:`, error);
      throw new Error(`Failed to transform prescription: ${error.message}`);
    }
  }
  
  /**
   * Transform eye measurements from Apollo format to eyewear-ML format
   * Converts from positive cylinder to negative cylinder notation
   * 
   * @param {string} eye - 'right' or 'left' eye
   * @param {Object} eyeData - Eye measurement data from Apollo
   * @returns {Object} - Transformed eye measurements
   */
  static transformEyeMeasurements(eye, eyeData) {
    if (!eyeData) {
      return { sphere: 0, cylinder: 0, axis: 0 };
    }
    
    const { sphere: apolloSphere, cylinder: apolloCylinder, axis } = eyeData;
    
    // Convert to numbers
    const originalSphere = typeof apolloSphere === 'string' 
      ? parseFloat(apolloSphere.replace('+', '')) 
      : (apolloSphere || 0);
      
    const originalCylinder = typeof apolloCylinder === 'string'
      ? parseFloat(apolloCylinder.replace('+', ''))
      : (apolloCylinder || 0);
    
    // Convert from positive to negative cylinder notation
    // In positive cylinder: combined power = sphere
    // In negative cylinder: combined power = sphere + cylinder
    const transformedSphere = originalSphere + originalCylinder;
    const transformedCylinder = originalCylinder !== 0 ? -Math.abs(originalCylinder) : 0;
    
    logger.debug(`Transformed ${eye} eye notation`, {
      original: `${originalSphere}/${originalCylinder}×${axis || 0}`,
      transformed: `${transformedSphere}/${transformedCylinder}×${axis || 0}`
    });
    
    return {
      sphere: transformedSphere,
      cylinder: transformedCylinder,
      axis: axis || 0
    };
  }
  
  /**
   * Parse add power value from string to number
   * @param {string|number} addPower - Add power value from Apollo
   * @returns {number} - Parsed add power value
   */
  static parseAddPower(addPower) {
    if (typeof addPower === 'number') return addPower;
    
    // Remove + prefix and parse as float
    const parsedValue = parseFloat(addPower.replace('+', ''));
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  
  /**
   * Extract pupillary distance from prescription data
   * @param {Object} prescription - Apollo prescription data
   * @returns {Object|null} - PD values { binocular, monocularLeft, monocularRight }
   */
  static extractPD(prescription) {
    // Check if PD is available directly
    if (prescription.pd) {
      const pdValue = typeof prescription.pd === 'string' 
        ? parseInt(prescription.pd, 10) 
        : prescription.pd;
        
      return { binocular: pdValue };
    }
    
    // Check if monocular PD values are available
    if (prescription.pdLeft && prescription.pdRight) {
      const pdLeft = typeof prescription.pdLeft === 'string' 
        ? parseInt(prescription.pdLeft, 10) 
        : prescription.pdLeft;
        
      const pdRight = typeof prescription.pdRight === 'string' 
        ? parseInt(prescription.pdRight, 10) 
        : prescription.pdRight;
        
      return {
        monocularLeft: pdLeft,
        monocularRight: pdRight,
        binocular: pdLeft + pdRight
      };
    }
    
    // Extract from comments as a fallback
    return this.extractPDFromComments(prescription.comments || '');
  }
  
  /**
   * Extract pupillary distance from prescription comments
   * @param {string} comments - Prescription comments
   * @returns {Object|null} - PD values { binocular, monocularLeft, monocularRight }
   */
  static extractPDFromComments(comments) {
    // Look for patterns like "PD: 64" or "PD=64" or "PD 64mm"
    const binocularMatch = comments.match(/PD[\s:=]+(\d+)/i);
    if (binocularMatch) {
      return { binocular: parseInt(binocularMatch[1], 10) };
    }
    
    // Look for patterns like "PD: 32/32" or "PD=31.5/32.5" or "PD 31 / 32"
    const monocularMatch = comments.match(/PD[\s:=]+(\d+\.?\d*)[\s\/]+(\d+\.?\d*)/i);
    if (monocularMatch) {
      const left = parseFloat(monocularMatch[1]);
      const right = parseFloat(monocularMatch[2]);
      return {
        monocularLeft: left,
        monocularRight: right,
        binocular: left + right
      };
    }
    
    return null;
  }
  
  /**
   * Extract additional measurements from prescription comments
   * @param {string} comments - Prescription comments
   * @returns {Object} - Additional fields extracted from comments
   */
  static extractAdditionalFields(comments) {
    const fields = {};
    
    // Extract vertex distance (VD) - Example: "VD: 12mm" or "VD=12"
    const vdMatch = comments.match(/VD[\s:=]+(\d+)/i);
    if (vdMatch) {
      fields.vertexDistance = parseInt(vdMatch[1], 10);
    }
    
    // Extract pantoscopic angle - Example: "PA: 5°" or "Panto=5"
    const paMatch = comments.match(/(?:PA|PANTO|PANTOSCOPIC)[\s:=]+(\d+)/i);
    if (paMatch) {
      fields.pantoscopicAngle = parseInt(paMatch[1], 10);
    }
    
    // Extract wrap angle - Example: "WA: 8°" or "Wrap=8"
    const waMatch = comments.match(/(?:WA|WRAP)[\s:=]+(\d+)/i);
    if (waMatch) {
      fields.wrapAngle = parseInt(waMatch[1], 10);
    }
    
    return fields;
  }
}

module.exports = PrescriptionTransformer;
