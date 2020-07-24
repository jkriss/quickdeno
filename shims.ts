const env = `
(function(){
  const internalEnv = {}
  Deno.env = {
    get(k) {
      return std.getenv(k) || internalEnv[k];
    },
    set(k,v) {
      internalEnv[k] = v.toString()
    }
  };
})()
`;

const args = `
  Deno.args = scriptArgs.slice(1);
`;

const exit = `Deno.exit = std.exit;`;

const readFile = `
Deno.readTextFileSync = function (path) {
  // TODO resolve file urls to paths
  const text = std.loadFile(path);
  if (text === null) throw new Error(\`Error reading file \${path}\`);
  return text;
}

Deno.readTextFile = async function (path) {
  return Deno.readTextFileSync(path)
}
`;

const stat = `

  Deno.statSync = function (path) {
    // TODO resolve file urls to paths
    const [obj, err] = os.stat(path)
    if (err) throw new Error(\`error: \${std.strerror(err)}\`)
    const isSymlink = obj.mode === os.S_IFLNK
    const isDirectory = obj.mode === os.S_IFDIR
    return Object.assign(obj, {
      isDirectory,
      isSymlink,
      isFile: !isDirectory && !isSymlink,
      mtime: obj.mtime ? new Date(obj.mtime) : null,
      atime: obj.atime ? new Date(obj.atime) : null,
      ctime: obj.ctime ? new Date(obj.ctime) : null
    })
  }
  
  Deno.stat = async function(path) {
    return Deno.statSync(path)
  }

  Deno.readDirSync = function(path) {
    const [names, err] = os.readdir(path)
    if (err) throw new Error(std.strerror(err))
    return names.filter(n => !['.', '..'].includes(n)).map(n => {
      const info = Deno.statSync(path + '/' + n)
      info.name = n
      return info
    })
  }

  Deno.readDir = Deno.readDirSync
  
`;

// from https://github.com/anonyco/FastestSmallestTextEncoderDecoder
const textEncoding = `
'use strict';(function(r){function x(){}function y(){}var z=String.fromCharCode,v={}.toString,A=v.call(r.SharedArrayBuffer),B=v(),q=r.Uint8Array,t=q||Array,w=q?ArrayBuffer:t,C=w.isView||function(g){return g&&"length"in g},D=v.call(w.prototype);w=y.prototype;var E=r.TextEncoder,a=new (q?Uint16Array:t)(32);x.prototype.decode=function(g){if(!C(g)){var l=v.call(g);if(l!==D&&l!==A&&l!==B)throw TypeError("Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
g=q?new t(g):g||[]}for(var f=l="",b=0,c=g.length|0,u=c-32|0,e,d,h=0,p=0,m,k=0,n=-1;b<c;){for(e=b<=u?32:c-b|0;k<e;b=b+1|0,k=k+1|0){d=g[b]&255;switch(d>>4){case 15:m=g[b=b+1|0]&255;if(2!==m>>6||247<d){b=b-1|0;break}h=(d&7)<<6|m&63;p=5;d=256;case 14:m=g[b=b+1|0]&255,h<<=6,h|=(d&15)<<6|m&63,p=2===m>>6?p+4|0:24,d=d+256&768;case 13:case 12:m=g[b=b+1|0]&255,h<<=6,h|=(d&31)<<6|m&63,p=p+7|0,b<c&&2===m>>6&&h>>p&&1114112>h?(d=h,h=h-65536|0,0<=h&&(n=(h>>10)+55296|0,d=(h&1023)+56320|0,31>k?(a[k]=n,k=k+1|0,n=-1):
(m=n,n=d,d=m))):(d>>=8,b=b-d-1|0,d=65533),h=p=0,e=b<=u?32:c-b|0;default:a[k]=d;continue;case 11:case 10:case 9:case 8:}a[k]=65533}f+=z(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9],a[10],a[11],a[12],a[13],a[14],a[15],a[16],a[17],a[18],a[19],a[20],a[21],a[22],a[23],a[24],a[25],a[26],a[27],a[28],a[29],a[30],a[31]);32>k&&(f=f.slice(0,k-32|0));if(b<c){if(a[0]=n,k=~n>>>31,n=-1,f.length<l.length)continue}else-1!==n&&(f+=z(n));l+=f;f=""}return l};w.encode=function(g){g=void 0===g?"":""+g;var l=g.length|
0,f=new t((l<<1)+8|0),b,c=0,u=!q;for(b=0;b<l;b=b+1|0,c=c+1|0){var e=g.charCodeAt(b)|0;if(127>=e)f[c]=e;else{if(2047>=e)f[c]=192|e>>6;else{a:{if(55296<=e)if(56319>=e){var d=g.charCodeAt(b=b+1|0)|0;if(56320<=d&&57343>=d){e=(e<<10)+d-56613888|0;if(65535<e){f[c]=240|e>>18;f[c=c+1|0]=128|e>>12&63;f[c=c+1|0]=128|e>>6&63;f[c=c+1|0]=128|e&63;continue}break a}e=65533}else 57343>=e&&(e=65533);!u&&b<<1<c&&b<<1<(c-7|0)&&(u=!0,d=new t(3*l),d.set(f),f=d)}f[c]=224|e>>12;f[c=c+1|0]=128|e>>6&63}f[c=c+1|0]=128|e&63}}return q?
f.subarray(0,c):f.slice(0,c)};E||(r.TextDecoder=x,r.TextEncoder=y)})(""+void 0==typeof global?""+void 0==typeof self?this:self:global);//AnonyCo
//# sourceMappingURL=https://cdn.jsdelivr.net/gh/AnonyCo/FastestSmallestTextEncoderDecoder/EncoderDecoderTogether.min.js.map
`;

// from https://github.com/jimmywarting/fetch-headers
const headers = `
(function() {
  const map = new WeakMap
  const wm = o => map.get(o)
  const normalizeValue = v => typeof v === 'string' ? v : String(v)
  const isIterable = o => o != null && typeof o[Symbol.iterator] === 'function'
  
  function normalizeName(name) {
    if (typeof name !== 'string')
      name = String(name)
  
    if (/[^a-z0-9\-#$%&'*+.\^_\`|~]/i.test(name))
      throw new TypeError('Invalid character in header field name')
  
    return name.toLowerCase()
  }
  
  class Headers {
  
    /**
     * Headers class
     *
     * @param   Object  headers  Response headers
     * @return  Void
     */
    constructor(headers) {
      map.set(this, Object.create(null))
  
      if ( isIterable(headers) )
        for (let [name, value] of headers)
          this.append(name, value)
  
      else if ( headers )
        for (let name of Object.keys(headers))
          this.append(name, headers[name])
    }
  
  
    /**
     * Append a value onto existing header
     *
     * @param   String  name   Header name
     * @param   String  value  Header value
     * @return  Void
     */
    append(name, value) {
      let map = wm(this)
  
      name = normalizeName(name)
      value = normalizeValue(value)
  
      if (!map[name])
        map[name] = []
  
      map[name].push(value)
    }
  
  
    /**
     * Delete all header values given name
     *
     * @param   String  name  Header name
     * @return  Void
     */
    delete(name) {
      delete wm(this)[normalizeName(name)]
    }
  
  
    /**
     * Iterate over all headers as [name, value]
     *
     * @return  Iterator
     */
    *entries() {
      let map = wm(this)
  
      for (let name in map)
        yield [name, map[name].join(',')]
    }
  
  
    /**
     * Return first header value given name
     *
     * @param   String  name  Header name
     * @return  Mixed
     */
    get(name) {
      let map = wm(this)
      name = normalizeName(name)
  
      return map[name] ? map[name][0] : null
    }
  
  
    /**
     * Check for header name existence
     *
     * @param   String   name  Header name
     * @return  Boolean
     */
    has(name) {
      return normalizeName(name) in wm(this)
    }
  
  
    /**
     * Iterate over all keys
     *
     * @return  Iterator
     */
    *keys() {
      for (let [name] of this)
        yield name
    }
  
  
    /**
     * Overwrite header values given name
     *
     * @param   String  name   Header name
     * @param   String  value  Header value
     * @return  Void
     */
    set(name, value) {
      wm(this)[normalizeName(name)] = [normalizeValue(value)]
    }
  
  
    /**
     * Iterate over all values
     *
     * @return  Iterator
     */
    *values() {
      for (let [name, value] of this)
        yield value
    }
  
  
    /**
     * The class itself is iterable
     * alies for headers.entries()
     *
     * @return  Iterator
     */
    [Symbol.iterator]() {
      return this.entries()
    }
  
  
    /**
     * Create the default string description.
     * It is accessed internally by the Object.prototype.toString().
     *
     * @return  String  [Object Headers]
     */
    get [Symbol.toStringTag]() {
      return 'Headers'
    }
  }
  globalThis.Headers = Headers
})()

`;

// from https://github.com/RyanG26/url-poly and https://github.com/mayurpatil888/urlSearchParamsPolyfill
const url = String.raw`
/* eslint-env browser, node */

(function(global) {
  const URL = function(url, base) {

    let _hash;
    let _hostname;
    let _password;
    let _pathname;
    let _port;
    let _protocol;
    let _search;
    let _username;
    
    Object.defineProperty(this, 'hash', {
        get: function() {
        return _hash;
        },
        set: function(value) {
        _hash = value.length > 0 ? '#' + value.match(/^#*(.*)/)[1] : '';
        return value;
        }
    });
    
    Object.defineProperty(this, 'host', {
        get: function() {
        return _port.length > 0 ? _hostname + ':' + _port : _hostname;
        },
        set: function(value) {
        const parts = value.split(':');
        this.hostname = parts[0];
        this.port = parts[1];
        return value;
        }
    });
    
    Object.defineProperty(this, 'hostname', {
        get: function() {
        return _hostname;
        },
        set: function(value) {
        _hostname = value.length > 0 ? encodeURIComponent(value) : _hostname;
        return value;
        }
    });
    
    function removeUsername(match, username, password) {
        if (password === '@') {
        return '';
        } else {
        return password;
        }
    }
    
    Object.defineProperty(this, 'href', {
        get: function() {
        let hrefStr = _protocol + '//';
        if (_username.length > 0 || _password.length > 0) {
            if (_username.length > 0) {
            hrefStr += _username;
            }
            if (_password.length > 0) {
            hrefStr += ':' + _password;
            }
            hrefStr += '@'
        }
        hrefStr += _hostname;
        if (_port.length > 0) {
            hrefStr += ':' + _port;
        }
        hrefStr += _pathname + _search + _hash;
        return hrefStr;
        },
        set: function(value) {
        
        this.protocol = value;
        value = value.replace(/.*?:\/*/, '');
        
        const usernameMatch = value.match(/([^:]*).*@/);
        this.username = usernameMatch ? usernameMatch[1] : '';
        value = value.replace(/([^:]*):?(.*@)/, removeUsername);
        
        const passwordMatch = value.match(/.*(?=@)/);
        this.password = passwordMatch ? passwordMatch[0] : '';
        value = value.replace(/.*@/, '');
        
        this.hostname = value.match(/[^:/?]*/);
        
        const portMatch = value.match(/:(\d+)/);
        this.port = portMatch ? portMatch[1] : '';
        
        const pathnameMatch = value.match(/\/([^?#]*)/);
        this.pathname = pathnameMatch ? pathnameMatch[1] : '';
        
        const searchMatch = value.match(/\?[^#]*/);
        this.search = searchMatch ? searchMatch[0] : '';
        
        const hashMatch = value.match(/\#.*/);
        this.hash = hashMatch ? hashMatch[0] : '';
        }
    });
    
    Object.defineProperty(this, 'origin', {
        get: function() {
        const originStr = _protocol + '//' + _hostname;
        if (_port.length > 0) {
            originStr += ':' + _port;
        }
        return originStr;
        },
        set: function(value) {
        
        this.protocol = value;
        value = value.replace(/.*?:\/*/, '');
        
        this.hostname = value.match(/[^:/?]*/);
        
        const portMatch = value.match(/:(\d+)/);
        this.port = portMatch ? portMatch[1] : '';
        }
    });
    
    Object.defineProperty(this, 'password', {
        get: function() {
        return _password;
        },
        set: function(value) {
        _password = encodeURIComponent(value);
        return value;
        }
    });
    
    Object.defineProperty(this, 'pathname', {
        get: function() {
        return _pathname;
        },
        set: function(value) {
        _pathname = '/' + value.match(/\/?(.*)/)[1];
        return value;
        }
    });
    
    Object.defineProperty(this, 'port', {
        get: function() {
        return _port;
        },
        set: function(value) {
        if (isNaN(value) || value === '') {
            _port = '';
        } else {
            _port = Math.min(65535, value).toString();
        }
        return value;
        }
    });
    
    Object.defineProperty(this, 'protocol', {
        get: function() {
        return _protocol;
        },
        set: function(value) {
        _protocol = value.match(/[^/:]*/)[0] + ':';
        return value;
        }
    });
    
    Object.defineProperty(this, 'search', {
        get: function() {
        return _search;
        },
        set: function(value) {
        _search = value.length > 0 ? '?' + value.match(/\??(.*)/)[1] : '';
        return value;
        }
    });
    
    Object.defineProperty(this, 'username', {
        get: function() {
        return _username;
        },
        set: function(value) {
        _username = value;
        }
    });

    // If a string is passed for url instead of location or link, then set the 
    if (typeof url === 'string') {

        const urlIsValid = /^[a-zA-z]+:\/\/.*/.test(url);
        const baseIsValid = /^[a-zA-z]+:\/\/.*/.test(base);

        if (urlIsValid) {
        this.href = url;
        }

        // If the url isn't valid, but the base is, then prepend the base to the url.
        else if (baseIsValid) {
        this.href = base + url;
        }

        // If no valid url or base is given, then throw a type error.
        else {
        throw new TypeError('URL string is not valid. If using a relative url, a second argument needs to be passed representing the base URL. Example: new URL("relative/path", "http://www.example.com");');
        }

    } else {

        // Copy all of the location or link properties to the
        // new URL instance.
        _hash = url.hash;
        _hostname = url.hostname;
        _password = url.password ? url.password : '';
        _pathname = url.pathname;
        _port = url.port;
        _protocol = url.protocol;
        _search = url.search;
        _username = url.username ? url.username: '';

    }
 
};

globalThis.URL = URL

})(globalThis);

(function (scope) {

  scope.URLSearchParams = scope.URLSearchParams  ||  function (searchString) {
      var self = this;
      self.searchString = searchString;
      if (searchString && !searchString.includes('/') && !searchString.startsWith('?')) self.searchString = '?'+searchString
      self.get = function (name) {
          var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(self.searchString);
          if (results == null) {
              return null;
          }
          else {
              return decodeURIComponent(results[1]) || 0;
          }
      };
  }

})(globalThis);
`;

// TODO use the right flags
const open = `

Deno.openSync = function(path, options) {
  const err = {}
  const f = std.open(path, "r", err)
  if (err.errno) throw new Error(\`Error opening file: \${str.strerr(err.errno)}\`)

  let done = false
  function readSync(p) {
    if (done) return null
    const result = f.read(p.buffer, 0, p.byteLength)
    if (f.error()) throw new Error('Error reading file')
    if (f.eof()) {
      if (result === 0) return null
      done = true
    } 
    return result
  }

  return {
    rid: f,
    read: readSync, 
    readSync,
    close: () => f.close()
  }
}

Deno.open = Deno.openSync

`;

const stdio = `
;(function(){

  Deno.stdout = {
    rid: std.out.fileno(),
    writeSync: (p) => std.out.write(p.buffer, 0, p.byteLength)
  }
  Deno.stdout.write = Deno.stdout.writeSync

  Deno.stderr = {
    rid: std.err.fileno(),
    writeSync: (p) => std.err.write(p.buffer, 0, p.byteLength),
  }
  Deno.stderr.write = Deno.stderr.writeSync

  console.error = (...parts) => {
    const te = new TextEncoder()
    const output = parts.map(p => p.toString()).join(" ")
    Deno.stderr.writeSync(te.encode(output))
    Deno.stderr.writeSync(te.encode('\\n'))
  }

  Deno.stdin = {
    rid: std.in.fileno(),
    readSync: function (p) {
      const fd = std.in.fileno()
      const result = os.read(fd, p.buffer, 0, p.buffer.byteLength)
      if (result < 0) throw new Error('Error reading file')
      return result
    }
  }

  Deno.stdin.read = async function (p) {
    const fd = std.in.fileno()
    return new Promise((resolve, reject) => {
      os.setReadHandler(fd, () => {
        os.setReadHandler(fd, null)
        const result = os.read(fd, p.buffer, 0, p.buffer.byteLength)
        if (result < 0) reject(new Error('Error reading file'))
        resolve(result)
      })
    })
  }

})()
`;

const timeout = `

;(function(){

  const timers = {}
  const sleepIncrement = 5

  globalThis.setInterval = function(fn, delay) {
    const t = Object.keys(timers).length+1
    function loop() {
      fn()
      if (timers[t]) {
        timers[t] = setTimeout(loop, delay)
      }
    }
    timers[t] = setTimeout(loop, delay)
    return t
  }

  globalThis.clearInterval = function(t) {
    if (timers[t]) clearTimeout(timers[t])
  }
  globalThis.setTimeout = os.setTimeout

  globalThis.clearInterval = function(t) {
    delete timers[t]
  }

  globalThis.clearTimeout = os.clearTimeout

})()

`;

const build = `{
  Deno.build = {
    os: os.platform
  }
}`;

const noColor = `
Deno.noColor = !!Deno.env.get('NO_COLOR')
`;

const all = {
  args,
  env,
  exit,
  headers,
  open,
  readFile,
  stat,
  textEncoding,
  url,
  timeout,
  stdio,
  build,
  noColor,
};

const allModules = new Map<string, string>(Object.entries(all));

export function shimNames() {
  return Object.keys(all);
}

export function get(moduleNames?: string[]) {
  const modules = moduleNames
    ? moduleNames.map((n) => allModules.get(n))
    : Array.from(allModules.values());

  return `  
  if (typeof Deno === "undefined") {
    const Deno = {};
    globalThis.global = globalThis
  
    ${modules.join("\n")}
  
    globalThis.Deno = Deno;
  }`;
}
