import * as http from 'http';
 
export class httpReq {
  url: string;
  path: string;
  method: string;
  
  constructor(url: string, path: string, method: string){
      this.url = url;
      this.path = path;
      this.method = method;
  }

  public get(cb: (res: any) => any): void {
      let opts = {
          'host': 'google.com',
          'path': `/`
      };
      http.request(opts, (r: http.IncomingMessage): void => {
          let data = '';
          
          r.on('data', (chunk: string): void => {
              console.log('Got chunk: ' + chunk);
              data += chunk;
          });
          r.on('end', (): void =>{
              console.log('Response has ended');
              console.log(data);
              cb(data);
          });
          r.on('error', (err): void => {
              console.log('Following error occured during request:\n');
              console.log(err);
          })
      }).end();
  }
}