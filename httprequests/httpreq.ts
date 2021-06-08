// http request and response handling
declare let ActiveXObject: (type: string) => void;
export function request(action: string, method: string, callback: any) {
  let x: any;
  if (window.XMLHttpRequest) x = new XMLHttpRequest();
  else x = ActiveXObject('Microsoft.XMLHTTP');
  x.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          callback(this.responseText);
      }
  };

  x.open(method, action, true);
  x.send();
}