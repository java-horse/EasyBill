const { GlmService } = require('./impl/glm-service');

class LLMServiceFactory {
  static getService(provider) {
    switch (provider) {
      case 'GLM':
        return new GlmService();
      default:
        return new GlmService();
    }
  }
}

exports.LLMServiceFactory = LLMServiceFactory;