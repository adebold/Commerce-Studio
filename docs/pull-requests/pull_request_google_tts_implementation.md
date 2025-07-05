# Google Cloud TTS Integration

This PR implements Google Cloud Text-to-Speech as an alternative neural TTS provider, complementing the existing NVIDIA Riva integration.

## Changes

- Add Google Cloud TTS provider implementation in `google-cloud-synthesis.ts`
- Update speech synthesis factory to support Google Cloud TTS provider
- Add deployment scripts for Google Cloud TTS setup
  - Linux/macOS: `deploy-google-tts.sh`
  - Windows: `deploy-google-tts.bat`
- Update environment variables and configuration options in `.env.example`
- Add new npm scripts for deployment and testing:
  - `deploy:google-tts` for setting up the Google Cloud service
  - `demo:voice-google` for testing the Google Cloud TTS integration
- Fix type definitions in `speech-synthesis.ts` to support both NVIDIA and Google implementations

## Testing Done

- Verified Google Cloud TTS voice list retrieval
- Tested text-to-speech synthesis with both plain text and SSML
- Confirmed cross-platform compatibility with deployment scripts
- Tested automatic fallback to browser-based TTS when cloud services unavailable
- Verified provider switching via environment variables

## Related Issues

- Closes #XX: Add support for Google Cloud TTS
- Relates to #YY: Voice enhancement plan

## Documentation

- Updated `.env.example` with Google Cloud TTS configuration options 
- Added comments explaining configuration options
- Created detailed deployment scripts with usage instructions

## Notes for Reviewers

- The implementation follows our provider-agnostic architecture, allowing developers to switch between TTS providers with minimal configuration changes
- We intentionally kept backward compatibility with the existing NVIDIA Riva implementation by supporting both `endpoint` and `apiEndpoint` property names
- The deployment scripts handle authentication setup, API enablement, and service account creation
