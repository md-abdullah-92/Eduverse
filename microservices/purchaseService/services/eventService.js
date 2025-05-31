// services/eventService.js
class EventService {
    constructor() {
      // In production, this would integrate with message queue (RabbitMQ, Kafka, etc.)
      this.eventHandlers = new Map();
    }
  
    async emitEnrollmentEvent(enrollmentData) {
      const event = {
        id: require('uuid').v4(),
        type: 'course.enrollment',
        timestamp: new Date().toISOString(),
        data: enrollmentData
      };
  
      console.log('Emitting enrollment event:', event);
  
      // In production, publish to message queue
      // await this.publishToQueue('enrollments', event);
  
      // For demo, just log and call any registered handlers
      const handlers = this.eventHandlers.get('course.enrollment') || [];
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      }
  
      return event;
    }
  
    // Method to register event handlers (for testing/demo purposes)
    onEvent(eventType, handler) {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, []);
      }
      this.eventHandlers.get(eventType).push(handler);
    }
  }
  
  module.exports = EventService;
  