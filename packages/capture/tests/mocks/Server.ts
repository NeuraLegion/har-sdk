import https from 'https';
import http from 'http';

export class Server {
  private server: http.Server;

  public async start(
    port: number,
    handler: http.RequestListener,
    protocol: 'http' | 'https' = 'http'
  ): Promise<Server> {
    this.server = (protocol === 'http' ? http : https).createServer(handler);

    await new Promise((resolve, reject) => {
      this.server.listen(port, () => resolve(true));
      this.server.once('error', (err: Error) => reject(err));
    });

    return this;
  }

  public async stop(): Promise<void> {
    await new Promise((resolve, reject) => {
      this.server.close((err?: Error) => (err ? reject(err) : resolve(true)));
    });
  }
}
