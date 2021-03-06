'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEth = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils.js');

var _paratiiEthVids = require('./paratii.eth.vids.js');

var _paratiiEthUsers = require('./paratii.eth.users.js');

var _paratiiEthEvents = require('./paratii.eth.events.js');

var _paratiiEthVouchers = require('./paratii.eth.vouchers.js');

var _paratiiEthDistributor = require('./paratii.eth.distributor.js');

var _paratiiEthTcr = require('./paratii.eth.tcr.js');

var _paratiiEthTcrPlaceholder = require('./paratii.eth.tcrPlaceholder.js');

var _paratiiEthTcrMigration = require('./paratii.eth.tcr.migration.js');

var _paratiiEthWallet = require('./paratii.eth.wallet.js');

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONTRACTS = {
  ParatiiToken: {
    artifact: require('paratii-contracts/build/contracts/ParatiiToken.json')
  },
  Avatar: {
    artifact: require('paratii-contracts/build/contracts/Avatar.json')
  },
  Registry: {
    artifact: require('paratii-contracts/build/contracts/Registry.json')
  },
  SendEther: {
    artifact: require('paratii-contracts/build/contracts/SendEther.json')
  },
  Users: {
    artifact: require('paratii-contracts/build/contracts/Users.json')
  },
  Videos: {
    artifact: require('paratii-contracts/build/contracts/Videos.json')

  },
  Store: {
    artifact: require('paratii-contracts/build/contracts/Store.json')

  },
  Likes: {
    artifact: require('paratii-contracts/build/contracts/Likes.json')

  },
  Views: {
    artifact: require('paratii-contracts/build/contracts/Views.json')

  },
  Vouchers: {
    artifact: require('paratii-contracts/build/contracts/Vouchers.json')

  },
  PTIDistributor: {
    artifact: require('paratii-contracts/build/contracts/PTIDistributor.json')

  },
  TcrPlaceholder: {
    artifact: require('paratii-contracts/build/contracts/TcrPlaceholder.json')
  },
  'sol-tcr/Registry': {
    artifact: require('sol-tcr/build/contracts/Registry.json')
  },
  'sol-tcr/PLCRVoting': {
    artifact: require('sol-tcr/build/contracts/PLCRVoting.json')
  },
  'sol-tcr/Parameterizer': {
    artifact: require('sol-tcr/build/contracts/Parameterizer.json')
  },
  'sol-tcr/DLL': {
    artifact: require('sol-tcr/build/contracts/DLL.json')
  },
  'sol-tcr/AttributeStore': {
    artifact: require('sol-tcr/build/contracts/AttributeStore.json')
  }
};
var Web3 = require('web3');
// const joi = require('joi')
/**
 * contains functions to interact with the Ethereum blockchain and the Paratii contracts.<br>
 * See {@link Paratii}
 * @param {ParatiiEthSchema} config configuration object to initialize Paratii object
 * @property {ParatiiVids} vids operations on videos
 * @property {ParatiiUsers} users operations on users
 * @property {ParatiiEthEvents} events manage subscriptions to Ethereum events
 * @property {ParatiiEthVouchers} vouchers Functions for redeeming vouchers
 * @property {ParatiiEthTcr} tcr TCR functionality
 * @example let paratii = new Paratii()
 * // paratii.eth is an instance of ParatiiEth; let's check the PTI balance of an account
 * paratii.eth.balanceOf('0xCbe4f07b343171ac37055B25a5266f48f6945b7d', 'PTI')
*/

var ParatiiEth = exports.ParatiiEth = function () {
  /**
  * @typedef {Array} ParatiiEthSchema
  * @property {accountSchema=} account
  * @property {ethSchema=} eth
  */
  function ParatiiEth(config) {
    (0, _classCallCheck3.default)(this, ParatiiEth);

    var schema = _joi2.default.object({
      account: _schemas.accountSchema,
      eth: _schemas.ethSchema
      //   web3: joi.any().default(null)
    });
    var result = _joi2.default.validate(config, schema, { allowUnknown: true });
    if (result.error) throw result.error;
    config.eth = result.value.eth;
    config.account = result.value.account;
    if (config.eth.provider.match(/(localhost|127\.0\.0\.1)/g)) {
      config.eth.isTestNet = true;
    } else {
      config.eth.isTestNet = false;
    }

    if (config.web3) {
      this.web3 = config.web3;
    } else {
      this.web3 = new Web3();
      if (config.eth.provider.substring(0, 2) === 'ws') {
        this._provider = new this.web3.providers.WebsocketProvider(config.eth.provider);
      } else {
        this._provider = new this.web3.providers.HttpProvider(config.eth.provider);
      }

      this.web3.setProvider(this._provider);
    }
    this.config = config;

    this.wallet = this.web3.eth.accounts.wallet = (0, _paratiiEthWallet.patchWallet)(this.web3.eth.accounts.wallet, this.config);
    this.setAccount(this.config.account);

    this.contracts = {};
    this.contracts.ParatiiToken = this.requireContract('ParatiiToken');
    this.contracts.Avatar = this.requireContract('Avatar');
    this.contracts.Registry = this.requireContract('Registry');
    this.contracts.SendEther = this.requireContract('SendEther');
    this.contracts.Users = this.requireContract('Users');
    this.contracts.Videos = this.requireContract('Videos');
    this.contracts.Store = this.requireContract('Store');
    this.contracts.Likes = this.requireContract('Likes');
    this.contracts.Views = this.requireContract('Views');
    this.contracts.Vouchers = this.requireContract('Vouchers');
    this.contracts.PTIDistributor = this.requireContract('PTIDistributor');
    this.contracts.TcrPlaceholder = this.requireContract('TcrPlaceholder');
    this.contracts.TcrRegistry = this.requireContract('sol-tcr/Registry');
    this.contracts.TcrPLCRVoting = this.requireContract('sol-tcr/PLCRVoting');
    this.contracts.TcrParameterizer = this.requireContract('sol-tcr/Parameterizer');
    this.contracts.TcrDLL = this.requireContract('sol-tcr/DLL');
    this.contracts.TcrAttributeStore = this.requireContract('sol-tcr/AttributeStore');

    this.vids = new _paratiiEthVids.ParatiiEthVids(this);
    this.users = new _paratiiEthUsers.ParatiiEthUsers(this);
    this.events = new _paratiiEthEvents.ParatiiEthEvents(this);
    this.vouchers = new _paratiiEthVouchers.ParatiiEthVouchers(this);
    this.tcr = new _paratiiEthTcr.ParatiiEthTcr(this);
    this.distributor = new _paratiiEthDistributor.ParatiiEthPTIDistributor(this);
    this.tcrPlaceholder = new _paratiiEthTcrPlaceholder.ParatiiEthTcrPlaceholder(this);
    this.tcrMigration = new _paratiiEthTcrMigration.ParatiiEthTcrMigration(this);
  }
  /**
   * [paratii.setAccount()](./Paratii.html#setAccount__anchor)
   */


  (0, _createClass3.default)(ParatiiEth, [{
    key: 'setAccount',
    value: function setAccount(opts) {
      var schema = _schemas.accountSchema;
      var result = _joi2.default.validate(opts, schema);
      if (result.error) throw result.error;
      var wallet = this.web3.eth.accounts.wallet;
      var _result$value = result.value,
          address = _result$value.address,
          privateKey = _result$value.privateKey,
          mnemonic = _result$value.mnemonic;

      this.config.account.address = address;
      this.config.account.privateKey = privateKey;
      this.web3.eth.testAccount = address;
      if (privateKey) {
        wallet.clear();
        var walletAccount = wallet.add(privateKey);
        if (address && walletAccount.address !== address) {
          throw Error('Private Key and Account address are not compatible! ');
        }
        this.config.account.address = walletAccount.address;
        this.config.account.privateKey = privateKey;
      } else if (mnemonic) {
        wallet.clear();
        wallet.createFromMnemonic(1, mnemonic);
        if (address && wallet[0].address !== address) {
          throw Error('Mnemonic ' + mnemonic + ' and account address ' + address + ' are not compatible!');
        }
        this.config.account.address = wallet[0].address;
        this.config.account.privateKey = wallet[0].privateKey;
      }
    }

    /**
     * Get the account
     * @example let acc = paratii.eth.getAccount()
     * @private
     */

  }, {
    key: 'getAccount',
    value: function getAccount() {
      var wallet = this.web3.eth.accounts.wallet;
      if (wallet.length > 0) {
        return wallet[0].address;
      }
    }

    /**
     * Get the contract instance specified
     * @param {string} name the name of the token
     * @return {Promise} Object representing the contract
     * @example await paratii.eth.getContract('ParatiiToken')
     */

  }, {
    key: 'getContract',
    value: function getContract(name) {
      var contract, address;
      return _regenerator2.default.async(function getContract$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              contract = this.contracts[name];

              if (contract) {
                _context.next = 3;
                break;
              }

              throw Error('No contract with name "' + name + '" is known');

            case 3:
              if (contract.options.address) {
                _context.next = 8;
                break;
              }

              _context.next = 6;
              return _regenerator2.default.awrap(this.getContractAddress(name));

            case 6:
              address = _context.sent;

              if (address && address !== '0x0') {
                contract.options.address = address;
              }

            case 8:
              if (!contract.methods.constructor._ethAccounts) {
                contract.methods.constructor._ethAccounts = this.web3.eth.accounts;
              }
              // contract.options.from = this.config.account.address
              contract.options.from = this.getAccount();

              return _context.abrupt('return', contract);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * creates the javascript contract object from the json file
     * @param  {string} contractName name of the contract
     * @return {string}              Contract Object
     * @example paratii.eth.requireContract('ParatiiToken')
     * @private
     */

  }, {
    key: 'requireContract',
    value: function requireContract(contractName) {
      var artifact = void 0,
          contract = void 0;
      var from = this.getAccount();

      artifact = CONTRACTS[contractName].artifact;
      if (!artifact) {
        throw Error('Unknown Paratii contract: ' + contractName);
      }

      contract = new this.web3.eth.Contract(artifact.abi, {
        from: from,
        gas: this.web3.utils.toHex(4e6),
        data: artifact.bytecode
      });
      return contract;
    }
  }, {
    key: 'linkByteCode',
    value: function linkByteCode(bytecode, links) {
      (0, _keys2.default)(links).forEach(function (libraryName) {
        var libraryAddress = links[libraryName];
        var regex = new RegExp('__' + libraryName + '_+', 'g');

        bytecode = bytecode.replace(regex, libraryAddress.replace('0x', ''));
      });

      return bytecode;
    }

    /**
     * deploys contract on the blockchain
     * @param  {string}  name name of the contract
     * @param  {Object}  args configuration for the contract (strings or numbers). It is allowed to pass more than one parameter
     * @return {Promise}      the deployed contract
     * @example await paratii.eth.deployContract('ParatiiToken')
     * @example let paratiiRegistryAddress = await paratii.eth.getRegistryAddress()
     * let likes = await this.deployContract('Likes', paratiiRegistryAddress)
     */

  }, {
    key: 'deployContract',
    value: function deployContract(name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var msg, contract, deployedContract;
      return _regenerator2.default.async(function deployContract$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this.getAccount()) {
                _context2.next = 3;
                break;
              }

              msg = 'You need an Ethereum account to write information to the blockchain - you can use .setAccount(address, [privateKey]) or specify it when creating the object';
              throw Error(msg);

            case 3:
              _context2.next = 5;
              return _regenerator2.default.awrap(this.getContract(name));

            case 5:
              contract = _context2.sent;
              _context2.next = 8;
              return _regenerator2.default.awrap(contract.deploy({ arguments: args }).send());

            case 8:
              deployedContract = _context2.sent;


              // deployedContract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
              this.contracts[name] = deployedContract;
              // console.log('deployed ', name)
              return _context2.abrupt('return', deployedContract);

            case 11:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'deployWithLinks',
    value: function deployWithLinks(name, links) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var linkedByteCode, deployedContract;
      return _regenerator2.default.async(function deployWithLinks$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              linkedByteCode = this.linkByteCode(this.contracts[name].options.data, links);


              this.contracts[name].options.data = linkedByteCode;

              _context3.next = 4;
              return _regenerator2.default.awrap(this.contracts[name].deploy({
                arguments: args
              }).send());

            case 4:
              deployedContract = _context3.sent;

              // deployedContract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
              this.contracts[name] = deployedContract;
              // console.log('deployed ', name)
              return _context3.abrupt('return', deployedContract);

            case 7:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    /**
     * deploy all Paratii contracts on the blockchain, and register them the registry contract
     * @return {Promise} all the paratii contracts
     * @example let contracts = await paratii.eth.deployContracts()
     * for (contractName in contracts) { console.log(contracts[contractName])}
     */

  }, {
    key: 'deployContracts',
    value: function deployContracts() {
      var tcrConfig, parameterizerConfig, paratiiRegistry, paratiiRegistryAddress, paratiiAvatar, paratiiToken, sendEther, userRegistry, videoRegistry, videoStore, likes, views, vouchers, distributor, tcrPlaceholder, tcrDLL, tcrAttributeStore, tcrPLCRVoting, tcrParameterizer, tcrRegistry;
      return _regenerator2.default.async(function deployContracts$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              tcrConfig = this.config.eth.tcrConfig;
              parameterizerConfig = tcrConfig.paramDefaults;
              _context4.next = 4;
              return _regenerator2.default.awrap(this.deployContract('Registry'));

            case 4:
              paratiiRegistry = _context4.sent;
              paratiiRegistryAddress = paratiiRegistry.options.address;
              _context4.next = 8;
              return _regenerator2.default.awrap(this.setRegistryAddress(paratiiRegistry.options.address));

            case 8:
              _context4.next = 10;
              return _regenerator2.default.awrap(this.deployContract('Avatar', paratiiRegistryAddress));

            case 10:
              paratiiAvatar = _context4.sent;
              _context4.next = 13;
              return _regenerator2.default.awrap(this.deployContract('ParatiiToken'));

            case 13:
              paratiiToken = _context4.sent;
              _context4.next = 16;
              return _regenerator2.default.awrap(this.deployContract('SendEther'));

            case 16:
              sendEther = _context4.sent;
              _context4.next = 19;
              return _regenerator2.default.awrap(this.deployContract('Users', paratiiRegistryAddress));

            case 19:
              userRegistry = _context4.sent;
              _context4.next = 22;
              return _regenerator2.default.awrap(this.deployContract('Videos', paratiiRegistryAddress));

            case 22:
              videoRegistry = _context4.sent;
              _context4.next = 25;
              return _regenerator2.default.awrap(this.deployContract('Store', paratiiRegistryAddress));

            case 25:
              videoStore = _context4.sent;
              _context4.next = 28;
              return _regenerator2.default.awrap(this.deployContract('Likes', paratiiRegistryAddress));

            case 28:
              likes = _context4.sent;
              _context4.next = 31;
              return _regenerator2.default.awrap(this.deployContract('Views', paratiiRegistryAddress));

            case 31:
              views = _context4.sent;
              _context4.next = 34;
              return _regenerator2.default.awrap(this.deployContract('Vouchers', paratiiRegistryAddress));

            case 34:
              vouchers = _context4.sent;
              _context4.next = 37;
              return _regenerator2.default.awrap(this.deployContract('PTIDistributor', paratiiRegistryAddress));

            case 37:
              distributor = _context4.sent;
              _context4.next = 40;
              return _regenerator2.default.awrap(this.deployContract('TcrPlaceholder', paratiiRegistryAddress, paratiiToken.options.address, this.web3.utils.toWei('5'), 100));

            case 40:
              tcrPlaceholder = _context4.sent;
              _context4.next = 43;
              return _regenerator2.default.awrap(this.deployContract('TcrDLL'));

            case 43:
              tcrDLL = _context4.sent;
              _context4.next = 46;
              return _regenerator2.default.awrap(this.deployContract('TcrAttributeStore'));

            case 46:
              tcrAttributeStore = _context4.sent;
              _context4.next = 49;
              return _regenerator2.default.awrap(this.deployWithLinks('TcrPLCRVoting', {
                DLL: tcrDLL.options.address,
                AttributeStore: tcrAttributeStore.options.address
              }, paratiiToken.options.address));

            case 49:
              tcrPLCRVoting = _context4.sent;
              _context4.next = 52;
              return _regenerator2.default.awrap(this.deployWithLinks('TcrParameterizer', {
                DLL: tcrDLL.options.address,
                AttributeStore: tcrAttributeStore.options.address
              }, paratiiToken.options.address, tcrPLCRVoting.options.address, parameterizerConfig.minDeposit, parameterizerConfig.pMinDeposit, parameterizerConfig.applyStageLength, parameterizerConfig.pApplyStageLength, parameterizerConfig.commitStageLength, parameterizerConfig.pCommitStageLength, parameterizerConfig.revealStageLength, parameterizerConfig.pRevealStageLength, parameterizerConfig.dispensationPct, parameterizerConfig.pDispensationPct, parameterizerConfig.voteQuorum, parameterizerConfig.pVoteQuorum));

            case 52:
              tcrParameterizer = _context4.sent;
              _context4.next = 55;
              return _regenerator2.default.awrap(this.deployWithLinks('TcrRegistry', {
                DLL: tcrDLL.options.address,
                AttributeStore: tcrAttributeStore.options.address
              }, paratiiToken.options.address, tcrPLCRVoting.options.address, tcrParameterizer.options.address, 'paratii test TCR integration'));

            case 55:
              tcrRegistry = _context4.sent;
              _context4.next = 58;
              return _regenerator2.default.awrap(this.getContract('Registry'));

            case 58:
              paratiiRegistry = _context4.sent;
              _context4.next = 61;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Avatar', paratiiAvatar.options.address).send());

            case 61:
              _context4.next = 63;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address).send());

            case 63:
              _context4.next = 65;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address).send());

            case 65:
              _context4.next = 67;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Videos', videoRegistry.options.address).send());

            case 67:
              _context4.next = 69;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Store', videoStore.options.address).send());

            case 69:
              _context4.next = 71;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Users', userRegistry.options.address).send());

            case 71:
              _context4.next = 73;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Likes', likes.options.address).send());

            case 73:
              _context4.next = 75;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Views', views.options.address).send());

            case 75:
              _context4.next = 77;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Vouchers', vouchers.options.address).send());

            case 77:
              _context4.next = 79;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('PTIDistributor', distributor.options.address).send());

            case 79:
              _context4.next = 81;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('TcrPlaceholder', tcrPlaceholder.options.address).send());

            case 81:
              _context4.next = 83;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('TcrDLL', tcrDLL.options.address).send());

            case 83:
              _context4.next = 85;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('TcrAttributeStore', tcrAttributeStore.options.address).send());

            case 85:
              _context4.next = 87;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('TcrRegistry', tcrRegistry.options.address).send());

            case 87:
              _context4.next = 89;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('TcrPLCRVoting', tcrPLCRVoting.options.address).send());

            case 89:
              _context4.next = 91;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('TcrParameterizer', tcrParameterizer.options.address).send());

            case 91:
              _context4.next = 93;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.web3.utils.toWei('0.3')));

            case 93:
              _context4.next = 95;
              return _regenerator2.default.awrap(paratiiAvatar.methods.addToWhitelist(videoStore.address));

            case 95:

              this.contracts.Avatar = paratiiAvatar;
              this.contracts.Registry = paratiiRegistry;
              this.contracts.ParatiiToken = paratiiToken;
              this.contracts.SendEther = sendEther;
              this.contracts.Users = userRegistry;
              this.contracts.Videos = videoRegistry;
              this.contracts.Likes = likes;
              this.contracts.Views = views;
              this.contracts.Vouchers = vouchers;
              this.contracts.PTIDistributor = distributor;
              this.contracts.Store = videoStore;
              this.contracts.TcrPlaceholder = tcrPlaceholder;
              this.contracts.TcrDLL = tcrDLL;
              this.contracts.TcrAttributeStore = tcrAttributeStore;
              this.contracts.TcrRegistry = tcrRegistry;
              this.contracts.TcrPLCRVoting = tcrPLCRVoting;
              this.contracts.TcrParameterizer = tcrParameterizer;

              _context4.next = 114;
              return _regenerator2.default.awrap(this.setRegistryAddress(paratiiRegistryAddress));

            case 114:
              return _context4.abrupt('return', this.contracts);

            case 115:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }

    /**
     * return all the contracts
     * @return {Promise}
     * @example let contracts = await paratii.eth.getContracts()
     * @example let contracts = await paratii.eth.deployContracts()
     * for (contractName in contracts) { console.log(contracts[contractName])}
     */

  }, {
    key: 'getContracts',
    value: function getContracts() {
      var name, contract, address;
      return _regenerator2.default.async(function getContracts$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.t0 = _regenerator2.default.keys(this.contracts);

            case 1:
              if ((_context5.t1 = _context5.t0()).done) {
                _context5.next = 11;
                break;
              }

              name = _context5.t1.value;
              contract = this.contracts[name];
              // console.log(`[${name}] = ${contract.options.address}`)

              if (contract.options.address) {
                _context5.next = 9;
                break;
              }

              _context5.next = 7;
              return _regenerator2.default.awrap(this.getContractAddress(name));

            case 7:
              address = _context5.sent;

              if (address && address !== '0x0') {
                contract.options.address = address;
              }

            case 9:
              _context5.next = 1;
              break;

            case 11:
              return _context5.abrupt('return', this.contracts);

            case 12:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /**
     * get the address of the contract on the blockchain
     * @param  {string}  name name of the contract
     * @return {Promise}      Contract address on the blockchain (String)
     * @example await paratii.eth.getContractAddress('ParatiiToken')
     */

  }, {
    key: 'getContractAddress',
    value: function getContractAddress(name) {
      var registryAddress, registry, address;
      return _regenerator2.default.async(function getContractAddress$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              registryAddress = this.getRegistryAddress();

              if (!(name === 'Registry')) {
                _context6.next = 3;
                break;
              }

              return _context6.abrupt('return', registryAddress);

            case 3:
              if (registryAddress) {
                _context6.next = 5;
                break;
              }

              throw Error('No registry address configured');

            case 5:
              _context6.prev = 5;
              _context6.next = 8;
              return _regenerator2.default.awrap(this.getContract('Registry'));

            case 8:
              registry = _context6.sent;

              if (registry) {
                _context6.next = 11;
                break;
              }

              throw Error('No registry contract!');

            case 11:
              _context6.next = 13;
              return _regenerator2.default.awrap(registry.methods.getContract(name).call());

            case 13:
              address = _context6.sent;
              return _context6.abrupt('return', address);

            case 17:
              _context6.prev = 17;
              _context6.t0 = _context6['catch'](5);

              if (!(_context6.t0.message === 'Couldn\'t decode address from ABI: 0x')) {
                _context6.next = 23;
                break;
              }

              throw Error('The registry address is not correct: ' + this.getRegistryAddress());

            case 23:
              if (!(_context6.t0.message === 'Invalid JSON RPC response: ""')) {
                _context6.next = 27;
                break;
              }

              throw Error('Cannot connect to Ethereum at ' + this.config.eth.provider + '? ' + _context6.t0.message);

            case 27:
              throw _context6.t0;

            case 28:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this, [[5, 17]]);
    }

    /**
     * Gets the address of the ParatiiRegistry contract
     * @example paratii.getRegistryAddress()
    */

  }, {
    key: 'getRegistryAddress',
    value: function getRegistryAddress() {
      return this.config.eth.registryAddress;
    }

    /**
     * Sets the address of the ParatiiRegistry contract
     * @param {string} address address of the ParatiiRegistry contract
     * @example paratii.eth.setRegistryAddress('0x0D6B5A54F940BF3D52E438CaB785981aAeFDf40C')
     * // the address must be a valid ethereum address
    */

  }, {
    key: 'setRegistryAddress',
    value: function setRegistryAddress(registryAddress) {
      this.config.eth.registryAddress = registryAddress;
      for (var name in this.contracts) {
        var contract = this.contracts[name];
        contract.options.address = undefined;
      }
    }

    /**
    * When called with a second argument, returns the balance of that Token.<br>
    * When called without a second argument, returns information about all relevant balances.
    * @param  {string}  address ethereum address
    * @param  {string}  [symbol] symbol of the token (ETH,PTI)
    * @return {Promise}         information about balances of that address
    * @example
    * // returns the ETH balance of the given address
    * await paratii.eth.balanceOf('some-address', 'ETH')
    * // returns the PTI balance of the given address
    * await paratii.eth.balanceOf('some-address', 'PTI')
    * // returns both the PTI and the ETH balance of the given address
    * await paratii.eth.balanceOf('some-address')
    */

  }, {
    key: 'balanceOf',
    value: function balanceOf(address, symbol) {
      var balance, balances, contract;
      return _regenerator2.default.async(function balanceOf$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              balance = void 0;
              balances = {};

              if (!(symbol && !['PTI', 'ETH'].includes(symbol))) {
                _context7.next = 4;
                break;
              }

              throw Error('Unknown symbol "' + symbol + '", must be one of "ETH", "PTI"');

            case 4:
              if (!(!symbol || symbol === 'ETH')) {
                _context7.next = 9;
                break;
              }

              _context7.next = 7;
              return _regenerator2.default.awrap(this.web3.eth.getBalance(address));

            case 7:
              balance = _context7.sent;

              balances.ETH = this.web3.utils.toBN(balance);

            case 9:
              if (!(!symbol || symbol === 'PTI')) {
                _context7.next = 17;
                break;
              }

              _context7.next = 12;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 12:
              contract = _context7.sent;
              _context7.next = 15;
              return _regenerator2.default.awrap(contract.methods.balanceOf(address).call());

            case 15:
              balance = _context7.sent;

              balances.PTI = this.web3.utils.toBN(balance);

            case 17:
              if (!symbol) {
                _context7.next = 21;
                break;
              }

              return _context7.abrupt('return', this.web3.utils.toBN(balance));

            case 21:
              return _context7.abrupt('return', balances);

            case 22:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the amount the beneficiary is allowed to transferFrom the owner account.
     * @param  {string}  ownerAddress       the address of the owner.
     * @param  {string}  beneficiaryAddress address of the contract/person allowed to spend owners money
     * @return {Promise}                    returns allowance in BN format.
     */

  }, {
    key: 'allowance',
    value: function allowance(ownerAddress, beneficiaryAddress) {
      var tokenContract, allowance;
      return _regenerator2.default.async(function allowance$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 2:
              tokenContract = _context8.sent;
              _context8.next = 5;
              return _regenerator2.default.awrap(tokenContract.methods.allowance(ownerAddress, beneficiaryAddress).call());

            case 5:
              allowance = _context8.sent;
              return _context8.abrupt('return', this.web3.utils.toBN(allowance));

            case 7:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this);
    }

    /**
     * ERC20 token approval
     * @param  {string}  beneficiary beneficiary ETH Address
     * @param  {Number}  amount      bignumber of amount to approve.
     * @return {Promise}             returns approvation tx
     */

  }, {
    key: 'approve',
    value: function approve(beneficiary, amount) {
      var tokenContract, approved, allowance;
      return _regenerator2.default.async(function approve$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 2:
              tokenContract = _context9.sent;
              _context9.next = 5;
              return _regenerator2.default.awrap(tokenContract.methods.approve(beneficiary, amount).send({ from: this.getAccount() }));

            case 5:
              approved = _context9.sent;

              if (approved) {
                _context9.next = 8;
                break;
              }

              throw new Error('Couldn\'t Approve ' + beneficiary + ' to spend ' + amount.toString() + ' from ' + this.getAccount());

            case 8:
              _context9.next = 10;
              return _regenerator2.default.awrap(this.allowance(this.getAccount(), beneficiary));

            case 10:
              allowance = _context9.sent;

              if (!(allowance.toString() !== amount.toString())) {
                _context9.next = 13;
                break;
              }

              throw new Error('allowance Error : allowance ' + allowance.toString() + ' !== amount ' + amount.toString());

            case 13:
              return _context9.abrupt('return', approved);

            case 14:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    }

    /**
     * send ETH from current account to beneficiary
     * @param  {string}  beneficiary ETH address
     * @param  {number}  amount      amount of ETH to be sent
     * @param  {string=}  description  description of the transaction (will be written in the blockchain)
     * @return {Promise}             information about the transaction recording the transfer
     * @example await paratii.eth._transferETH('some-address', 20, 'an-optional-description')
     * @private
     */

  }, {
    key: '_transferETH',
    value: function _transferETH(beneficiary, amount, description) {
      var contract, from, balance;
      return _regenerator2.default.async(function _transferETH$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _regenerator2.default.awrap(this.getContract('SendEther'));

            case 2:
              contract = _context10.sent;

              if (!(!contract.options || !contract.options.address)) {
                _context10.next = 5;
                break;
              }

              throw Error('No SendEther contract known - please run paratii.diagnose()');

            case 5:
              from = this.getAccount();

              if (from) {
                _context10.next = 8;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 8:

              if (!description) {
                description = '';
              }
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);

              _context10.next = 13;
              return _regenerator2.default.awrap(this.web3.eth.getBalance(from));

            case 13:
              balance = _context10.sent;

              if (!this.web3.utils.toBN(balance).lt(this.web3.utils.toBN(amount))) {
                _context10.next = 16;
                break;
              }

              throw new Error('Insufficient balance! Cannot transfer ' + amount + ' ETH');

            case 16:
              _context10.prev = 16;
              _context10.next = 19;
              return _regenerator2.default.awrap(contract.methods.transfer(beneficiary, description).send({ value: amount }));

            case 19:
              return _context10.abrupt('return', _context10.sent);

            case 22:
              _context10.prev = 22;
              _context10.t0 = _context10['catch'](16);
              throw _context10.t0;

            case 25:
            case 'end':
              return _context10.stop();
          }
        }
      }, null, this, [[16, 22]]);
    }
    /**
     * send PTI from current account to beneficiary
     * @param  {string}  beneficiary ETH address
     * @param  {number}  amount      amount of PTI to be sent
     * @return {Promise}             information about the transaction recording the transfer
     * @example await paratii.eth._transferPTI('some-address', 20)
     * @private
     */

  }, {
    key: '_transferPTI',
    value: function _transferPTI(beneficiary, amount) {
      var contract, from, balanceFrom, result;
      return _regenerator2.default.async(function _transferPTI$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 2:
              contract = _context11.sent;

              if (!(!contract.options || !contract.options.address)) {
                _context11.next = 5;
                break;
              }

              throw Error('No ParatiiToken contract known - please run paratii.diagnose()');

            case 5:
              from = this.getAccount();

              if (from) {
                _context11.next = 8;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 8:
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);
              _context11.next = 12;
              return _regenerator2.default.awrap(this.balanceOf(from, 'PTI'));

            case 12:
              balanceFrom = _context11.sent;
              _context11.next = 15;
              return _regenerator2.default.awrap(contract.methods.transfer(beneficiary, amount).send());

            case 15:
              result = _context11.sent;

              if (result.events.Transfer) {
                _context11.next = 19;
                break;
              }

              if (!(amount > balanceFrom)) {
                _context11.next = 19;
                break;
              }

              throw Error('Insufficient balance! Cannot transfer ' + amount + ' PTI');

            case 19:
              return _context11.abrupt('return', result);

            case 20:
            case 'end':
              return _context11.stop();
          }
        }
      }, null, this);
    }
    /**
     * Use this to send ETH or PTI from paratii.config.address
     * @param  {string}  beneficiary ETH address
     * @param  {number}  amount      amount of ETH/PTI to be sent, value in Wei
     * @param  {string}  symbol      symbol of the token to send (ETH,PTI)
     * @param  {string=}  description description to be inserted in the blockchain
     * @return {Promise}             information about the transaction recording the transfer
     * @example let result = await paratii.eth.transfer('some-address', 20000000000000000000, 'ETH', 'thanks for all the fish')
     */

  }, {
    key: 'transfer',
    value: function transfer(beneficiary, amount, symbol, description) {
      return _regenerator2.default.async(function transfer$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              if (!(symbol === 'ETH')) {
                _context12.next = 4;
                break;
              }

              return _context12.abrupt('return', this._transferETH(beneficiary, amount, description));

            case 4:
              if (!(symbol === 'PTI')) {
                _context12.next = 6;
                break;
              }

              return _context12.abrupt('return', this._transferPTI(beneficiary, amount));

            case 6:
            case 'end':
              return _context12.stop();
          }
        }
      }, null, this);
    }
    /**
     * Pings the provider to which the web3 is configured to connect to (see the set up in paratii.eth.js constructor)
     * @return {Promise} that resolves in a boolean
     */

  }, {
    key: 'checkEth',
    value: function checkEth() {
      var _this = this;

      return _regenerator2.default.async(function checkEth$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              return _context13.abrupt('return', new _promise2.default(function (resolve) {
                _this.web3.eth.net.isListening().then(function () {
                  resolve(true);
                }).catch(function (e) {
                  resolve(false);
                });
              }));

            case 1:
            case 'end':
              return _context13.stop();
          }
        }
      }, null, this);
    }
    /**
     * Pings the provider to which the web3 is configured to connect to (see the set up in paratii.eth.js constructor)
     * @return {Promise} that resolves in an object
     */

  }, {
    key: 'serviceCheckEth',
    value: function serviceCheckEth() {
      var _this2 = this;

      return _regenerator2.default.async(function serviceCheckEth$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              return _context14.abrupt('return', new _promise2.default(function (resolve) {
                var executionStart = new Date().getTime();

                _this2.web3.eth.net.isListening().then(function () {
                  var executionEnd = new Date().getTime();
                  var executionTime = executionEnd - executionStart;

                  var ethServiceCheckObject = {
                    provider: _this2.config.eth.provider,
                    responseTime: executionTime,
                    response: 'listening',
                    responsive: true
                  };
                  resolve(ethServiceCheckObject);
                }).catch(function (e) {
                  var ethServiceCheckObject = {
                    provider: _this2.config.eth.provider,
                    responseTime: 0,
                    response: 'not listening',
                    responsive: false
                  };
                  resolve(ethServiceCheckObject);
                });
              }));

            case 1:
            case 'end':
              return _context14.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEth;
}();