/* global ArrayBuffer */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFSRemote = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _schemas = require('./schemas.js');

var _events = require('events');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Resumable = require('resumablejs');
var Multiaddr = require('multiaddr');
/**
 * IPFS UPLOADER : Paratii IPFS uploader interface.
 * @extends EventEmitter
 * @param {ParatiiIPFSUploaderSchema} opts
 */

var ParatiiIPFSRemote = exports.ParatiiIPFSRemote = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFSRemote, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSUploaderSchema
  * @property {?ipfsSchema} ipfs
  * @property {?Object} ParatiiIPFS
  */
  function ParatiiIPFSRemote(opts) {
    (0, _classCallCheck3.default)(this, ParatiiIPFSRemote);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiIPFSRemote.__proto__ || (0, _getPrototypeOf2.default)(ParatiiIPFSRemote)).call(this));

    var schema = _joi2.default.object({
      ipfs: _schemas.ipfsSchema,
      paratiiIPFS: _joi2.default.object().optional()
      //   onReadyHook: joi.array().ordered().default([]),
      //   protocol: joi.string().default(null),
    });
    var result = _joi2.default.validate(opts, schema, { allowUnknown: true });
    if (result.error) throw result.error;
    _this.config = result.value;
    _this._ipfs = _this.config.paratiiIPFS; // this is the paratii.ipfs.js
    return _this;
  }

  /**
   * Upload a file over XHR to the transcoder. To be called with an event emitter as the last argument
   * @param  {Object} file       file to upload
   * @param  {String} hashedFile hash of the file ??
   * @param  {EventEmitter} ev         event emitter
   * @example this.xhrUpload(file, hashedFile, ev)
   * @memberof paratii.ipfs.uploader
   */


  (0, _createClass3.default)(ParatiiIPFSRemote, [{
    key: 'xhrUpload2',
    value: function xhrUpload2(file, hashedFile, ev) {
      var r = new Resumable({
        target: this.config.ipfs.transcoderDropUrl + '/' + hashedFile.hash,
        chunkSize: this.config.ipfs.xhrChunkSize,
        simultaneousUploads: 4,
        testChunks: false,
        throttleProgressCallbacks: 1,
        maxFileSize: this.config.ipfs.maxFileSize
      });
      r.on('fileAdded', function (file, ev) {
        console.log('file ', file, 'added');
      });

      r.on('fileProgress', function (file) {
        ev.emit('progress', r.progress() * 100);
      });

      r.on('complete', function () {
        ev.emit('fileReady', hashedFile);
      });

      r.on('error', function (err, file) {
        console.error('file ', file, 'err ', err);
      });

      r.addFile(file._html5File);

      setTimeout(function () {
        r.upload();
      }, 1);
    }

    /**
      * Upload a file over XHR to the transcoder. To be called with an event emitter as the last argument
      * @param  {Object} file file to upload
      * @param  {string} hash IPFS multi-hash of the file
      * @param  {?EventEmitter} ev optional event emitter
      * @example this.xhrUpload(file, hashedFile)
       */

  }, {
    key: 'xhrUpload',
    value: function xhrUpload(file, hash, ev) {
      if (!ev) {
        ev = new _events.EventEmitter();
      }
      var r = new Resumable({
        target: this.config.ipfs.transcoderDropUrl + '/' + hash,
        chunkSize: this.config.ipfs.xhrChunkSize,
        simultaneousUploads: 4,
        testChunks: false,
        throttleProgressCallbacks: 1,
        maxFileSize: this.config.ipfs.maxFileSize
      });
      r.on('fileAdded', function (file, ev) {
        console.log('file ', file.fileName, 'added');
      });

      r.on('fileProgress', function (file) {
        ev.emit('progress', r.progress() * 100);
      });

      r.on('complete', function () {
        ev.emit('fileReady', file);
      });

      r.on('error', function (err, file) {
        console.error('file ', file, 'err ', err);
      });

      r.addFile(file._html5File);

      setTimeout(function () {
        r.upload();
      }, 1);
      return ev;
    }

    /**
     * [getMetaData description]
     * @param  {Object} fileHash [description]
     * @param  {Object} options  [description]
     * @return {Object}          [description]
     * @private
     */

  }, {
    key: 'getMetaData',
    value: function getMetaData(fileHash, options) {
      var _this2 = this;

      return new _promise2.default(function (resolve, reject) {
        var schema = _joi2.default.object({
          transcoder: _joi2.default.string().default(_this2.config.ipfs.defaultTranscoder),
          transcoderId: _joi2.default.any().default(Multiaddr(_this2.config.ipfs.defaultTranscoder).getPeerId())
        }).unknown();

        _this2._ipfs.log('Signaling transcoder getMetaData...');
        var result = _joi2.default.validate(options, schema);
        var error = result.error;
        if (error) reject(error);
        var opts = result.value;
        var ev = void 0;
        if (opts.ev) {
          ev = opts.ev;
        } else {
          ev = new _events.EventEmitter();
        }
        _this2._ipfs.start().then(function () {
          var msg = _this2._ipfs.protocol.createCommand('getMetaData', { hash: fileHash });
          // FIXME : This is for dev, so we just signal our transcoder node.
          // This needs to be dynamic later on.
          _this2._ipfs.ipfs.swarm.connect(opts.transcoder, function (err, success) {
            if (err) return reject(err);

            opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId();
            _this2._ipfs.log('transcoderId: ', opts.transcoderId);
            _this2._node.swarm.peers(function (err, peers) {
              _this2._ipfs.log('peers: ', peers);
              if (err) return reject(err);

              peers.map(function (peer) {
                _this2._ipfs.log('peerID : ', peer.peer.id.toB58String(), opts.transcoderId, peer.peer.id.toB58String() === opts.transcoder);
                if (peer.peer.id.toB58String() === opts.transcoderId) {
                  _this2._ipfs.log('sending getMetaData msg to ' + peer.peer.id.toB58String() + ' with request to transcode ' + fileHash);
                  _this2._ipfs.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
                    if (err) {
                      ev.emit('getMetaData:error', err);
                      return ev;
                    }
                  });
                }
              });

              // paratii getMetaData signal.
              _this2._ipfs.on('protocol:incoming', function (peerId, command) {
                _this2._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
                var commandStr = command.payload.toString();
                var argsObj = void 0;
                try {
                  argsObj = JSON.parse(command.args.toString());
                } catch (e) {
                  _this2._ipfs.error('couldn\'t parse args, ', command.args.toString());
                }

                switch (commandStr) {
                  case 'getMetaData:error':
                    if (argsObj.hash === fileHash) {
                      console.log('DEBUG getMetaData ERROR: fileHash: ', fileHash, ' , errHash: ', argsObj.hash);
                      reject(argsObj.err);
                    }
                    break;
                  case 'getMetaData:done':
                    if (argsObj.hash === fileHash) {
                      console.log('data: ', argsObj.data);
                      var _result = argsObj.data;
                      resolve(_result);
                    }
                    break;
                  default:
                    _this2._ipfs.log('unknown command : ', commandStr);
                }
              });
            });
          });
        });
      });
    }
    /**
     * Signal the remote node to pin a File
     * @param  {Object} fileHash hash of the file to pin
     * @param  {Object} options  [description]
     * @return {Promise}  a Promise/EventEmitter that resolves inthe hash of the pinned file
     * @example paratii.ipfs.remote.pinFile('QmQP5SJzEBKy1uAGASDfEPqeFJ3HUbEp4eZzxvTLdZZYwB')
     */

  }, {
    key: 'pinFile',
    value: function pinFile(fileHash, options) {
      var _this3 = this;

      if (options === undefined) {
        options = {};
      }

      var schema = _joi2.default.object({
        author: _joi2.default.string().default('0x'), // ETH/PTI address of the file owner
        transcoder: _joi2.default.string().default(this.config.ipfs.defaultTranscoder),
        transcoderId: _joi2.default.any().default(Multiaddr(this.config.ipfs.defaultTranscoder).getPeerId()),
        size: _joi2.default.number().default(0)
      }).unknown();

      this._ipfs.log('Signaling transcoder to pin ' + fileHash);

      var result = _joi2.default.validate(options, schema);
      var error = result.error;
      if (error) throw error;
      var opts = result.value;

      var ev = void 0;
      if (opts.ev) {
        ev = opts.ev;
      } else {
        ev = new _events.EventEmitter();
      }

      var msg = this._ipfs.protocol.createCommand('pin', { hash: fileHash, author: opts.author, size: opts.size });
      // FIXME : This is for dev, so we just signal our transcoder node.
      // This needs to be dynamic later on.
      this._node.swarm.connect(opts.transcoder, function (err, success) {
        if (err) return ev.emit('pin:error', err);
        _this3._node.swarm.peers(function (err, peers) {
          _this3._ipfs.log('peers: ', peers);
          if (err) return ev.emit('pin:error', err);
          peers.map(function (peer) {
            try {
              _this3._ipfs.log('peer.peer.toB58String(): ', peer.peer.toB58String());
              if (peer.peer.toB58String() === opts.transcoderId) {
                _this3._ipfs.log('sending pin msg to ' + peer.peer._idB58String + ' with request to pin ' + fileHash);
                _this3._ipfs.protocol.network.sendMessage(peer.peer, msg, function (err) {
                  if (err) {
                    ev.emit('pin:error', err);
                    console.log(err);
                    return ev;
                  }
                });
              }
            } catch (e) {
              console.log('PEER ERROR :', e, peer);
            }
          });

          // paratii pinning response.
          _this3._ipfs.on('protocol:incoming', _this3._pinResponseHandler(ev));
        });
      });

      return ev;
    }
    /**
     * [_pinResponseHandler description]
     * @param  {Object} ev [description]
     * @return {Object}    [description]
     * @private
     */

  }, {
    key: '_pinResponseHandler',
    value: function _pinResponseHandler(ev) {
      var _this4 = this;

      return function (peerId, command) {
        _this4._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
        var commandStr = command.payload.toString();
        var argsObj = void 0;
        try {
          argsObj = JSON.parse(command.args.toString());
        } catch (e) {
          _this4._ipfs.log('couldn\'t parse args, ', command.args.toString());
        }

        switch (commandStr) {
          case 'pin:error':
            ev.emit('pin:error', argsObj.err);
            break;
          case 'pin:progress':
            ev.emit('pin:progress', argsObj.hash, argsObj.chunkSize, argsObj.percent);
            break;
          case 'pin:done':
            ev.emit('pin:done', argsObj.hash);
            break;
          default:
            _this4._ipfs.log('unknown command : ', commandStr);
        }
      };
    }

    // grabYt (url, onResponse, callback) {
    //   let starttime
    //   let fileSize
    //   let video = ytdl(url)
    //   video.once('response', () => {
    //     this._ipfs.log(`starting ${url}`)
    //     starttime = Date.now()
    //     onResponse(null, starttime)
    //   })
    //
    //   video.on('error', (err) => {
    //     onResponse(err)
    //   })
    //
    //   video.on('progress', (chunkLength, downloaded, total) => {
    //     fileSize = total
    //     // const floatDownloaded = downloaded / total
    //     // const downloadedMinutes = (Date.now() - starttime) / 1000 / 60
    //     // readline.cursorTo(process.stdout, 0)
    //     // process.stdout.write(`${(floatDownloaded * 100).toFixed(2)}% downloaded`)
    //     // process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`)
    //     // process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`)
    //     // process.stdout.write(`, estimated time left: ${(downloadedMinutes / floatDownloaded - downloadedMinutes).toFixed(2)}minutes `)
    //     // readline.moveCursor(process.stdout, 0, -1)
    //   })
    //
    //   video.on('end', () => {
    //     process.stdout.write('\n\n')
    //     // cb(null, output)
    //   })
    //
    //   var total = 0
    //   function updateProgress (chunkLength) {
    //     total += chunkLength
    //     this._ipfs.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    //   }
    //
    //   pull(
    //     pull.values([{
    //       path: url,
    //       content: pull(
    //         toPull(video),
    //         pull.through((chunk) => updateProgress(chunk.length))
    //       )
    //     }]),
    //     this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
    //     this._signalTranscoderPull(callback)
    //   )
    // }
    //
    // grabVimeo (url, onResponse, callback) {
    //   let starttime
    //   // let total = 0
    //   let video = vidl(url, {quality: '720p'})
    //
    //   video.once('response', () => {
    //     this._ipfs.log(`starting ${url}`)
    //     starttime = Date.now()
    //     onResponse(null, starttime)
    //   })
    //
    //   video.on('data', (chunk) => {
    //     // total += chunk.length / 1024 / 1024
    //   })
    //
    //   video.on('end', () => {
    //     // process.stdout.write('\n\n')
    //     // cb(null, output)
    //   })
    //
    //   function updateProgress (chunkLength) {
    //     // this._ipfs.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    //   }
    //
    //   pull(
    //     pull.values([{
    //       path: url,
    //       content: pull(
    //         toPull(video),
    //         pull.through((chunk) => updateProgress(chunk.length))
    //       )
    //     }]),
    //     this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
    //     this._signalTranscoderPull(callback)
    //   )
    // }
    //

  }]);
  return ParatiiIPFSRemote;
}(_events.EventEmitter);