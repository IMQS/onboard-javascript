export function request(action: string, method: string, callback: any) {
  var x: any = {};
  if (window.XMLHttpRequest) x = new XMLHttpRequest();
  // else x = new ActiveXObject('Microsoft.XMLHTTP');
  x.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          callback(this.responseText);
      }
  };

  x.open(method, action, true);
  x.send();
}