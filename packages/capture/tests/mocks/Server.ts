import https from 'https';
import http from 'http';
import { once } from 'events';

export class Server {
  private server: http.Server;

  public async start(
    port: number,
    handler: http.RequestListener,
    protocol: 'http' | 'https' = 'http'
  ): Promise<Server> {
    this.server = (protocol === 'http' ? http : https).createServer(handler);

    process.nextTick(() => this.server.listen(port));

    await once(this.server, 'listening');

    return this;
  }

  public async stop(): Promise<void> {
    await new Promise((resolve, reject) => {
      this.server.close((err?: Error) => (err ? reject(err) : resolve(true)));
    });
  }

  public isRunning(): boolean {
    return this.server.listening;
  }
}
