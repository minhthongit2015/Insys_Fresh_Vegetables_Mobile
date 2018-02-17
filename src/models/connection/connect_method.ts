

export class ConnectMethod {
  public connecting: boolean;
  public connected: boolean;

  public setup(destination, onPackages) { }

  /**
   * Override this method to connect by each different method
   */
  connect(args) { }

  /**
   * Override this method to disconnect by each different method
   */
  disconnect() { }

  /**
   * Override this method to send package by each different method
   */
  send(packages) { }



  /**
   * Does not override this method. This method is used in Connection Manager to control the response.
   * Call this method in onmessage event of each method.
   */
  onPackages(packages) { }

  /**
   * Does not override this method. This method is used in Connection Manager to control the connecting event
   */
  onConnecting() { }

  /**
   * Does not override this method. This method is used in Connection Manager to control the connected event
   */
  onConnected() { }

  /**
   * Does not override this method. This method is used in Connection Manager to control the connect failed event
   */
  onConnectFailed(err) { }
  
  /**
   * Does not override this method. This method is used in Connection Manager to control the disconnect event
   */
  onDisconnected() { }
}