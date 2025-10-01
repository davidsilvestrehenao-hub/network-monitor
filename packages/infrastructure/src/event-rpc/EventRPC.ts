import type { IEventBus, ILogger } from '@network-monitor/shared';

/**
 * EventRPC - Request-Response pattern over EventBus
 * 
 * This class enables event-driven request-response communication,
 * eliminating direct service dependencies while maintaining
 * type-safe request-response flows.
 * 
 * @example
 * ```typescript
 * const eventRPC = new EventRPC(eventBus, logger);
 * 
 * const target = await eventRPC.request<CreateTargetData, Target>(
 *   'TARGET_CREATE_REQUESTED',
 *   'TARGET_CREATED',
 *   'TARGET_CREATE_FAILED',
 *   { name: 'Google', address: 'https://google.com' }
 * );
 * ```
 */
export class EventRPC {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  /**
   * Make an event-driven request and wait for response
   * 
   * @param requestEvent - Event name to emit for the request
   * @param successEvent - Event name to listen for success response
   * @param failureEvent - Event name to listen for failure response
   * @param data - Request data payload
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @returns Promise that resolves with response data or rejects on error/timeout
   */
  async request<TRequest, TResponse>(
    requestEvent: string,
    successEvent: string,
    failureEvent: string,
    data: TRequest,
    timeout = 10000
  ): Promise<TResponse> {
    const requestId = crypto.randomUUID();
    
    this.logger.debug(`EventRPC: Sending request`, {
      requestEvent,
      requestId,
      data,
    });
    
    return new Promise<TResponse>((resolve, reject) => {
      // Setup timeout
      const timer = setTimeout(() => {
        this.logger.error(`EventRPC: Request timeout`, {
          requestEvent,
          requestId,
          timeout,
        });
        reject(new Error(`Request timeout: ${requestEvent} (${timeout}ms)`));
      }, timeout);
      
      // Listen for success response
      this.eventBus.once<TResponse>(
        `${successEvent}_${requestId}`,
        (response) => {
          clearTimeout(timer);
          this.logger.debug(`EventRPC: Success response received`, {
            requestEvent,
            successEvent,
            requestId,
          });
          resolve(response!);
        }
      );
      
      // Listen for failure response
      this.eventBus.once<{ error: string }>(
        `${failureEvent}_${requestId}`,
        (error) => {
          clearTimeout(timer);
          this.logger.error(`EventRPC: Failure response received`, {
            requestEvent,
            failureEvent,
            requestId,
            error,
          });
          reject(new Error(error?.error || 'Unknown error'));
        }
      );
      
      // Emit the request with requestId
      this.eventBus.emit(requestEvent, { 
        ...(data as object), 
        requestId 
      });
    });
  }

  /**
   * Create a typed request function for a specific operation
   * 
   * @example
   * ```typescript
   * const createTarget = eventRPC.createTypedRequest<CreateTargetData, Target>(
   *   'TARGET_CREATE_REQUESTED',
   *   'TARGET_CREATED',
   *   'TARGET_CREATE_FAILED'
   * );
   * 
   * const target = await createTarget({ name: 'Google', address: 'https://google.com' });
   * ```
   */
  createTypedRequest<TRequest, TResponse>(
    requestEvent: string,
    successEvent: string,
    failureEvent: string,
    defaultTimeout?: number
  ): (data: TRequest, timeout?: number) => Promise<TResponse> {
    return (data: TRequest, timeout?: number) => 
      this.request<TRequest, TResponse>(
        requestEvent,
        successEvent,
        failureEvent,
        data,
        timeout ?? defaultTimeout
      );
  }
}
