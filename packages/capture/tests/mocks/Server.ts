import https from 'https';
import http from 'http';
import { once } from 'events';
import { AddressInfo } from 'net';

export class Server {
  private server: http.Server;

  public async start(
    handler: http.RequestListener,
    protocol: 'http' | 'https' = 'http'
  ): Promise<AddressInfo> {
    this.server = (protocol === 'http' ? http : https).createServer(handler);

    process.nextTick(() => this.server.listen());

    await once(this.server, 'listening');

    return this.server.address() as AddressInfo;
  }

  public async stop(): Promise<void> {
    if (this.server?.listening) {
      await new Promise<void>((resolve, reject) =>
        this.server.close((err?: Error) => (err ? reject(err) : resolve(null)))
      );
    }
  }

  public isRunning(): boolean {
    return !!this.server?.listening;
  }
}
