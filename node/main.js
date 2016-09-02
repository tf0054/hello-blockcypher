'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactBootstrap = require('react-bootstrap');

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DApps = function (_Component) {
  _inherits(DApps, _Component);

  function DApps(props) {
    _classCallCheck(this, DApps);

    var _this = _possibleConstructorReturn(this, (DApps.__proto__ || Object.getPrototypeOf(DApps)).call(this, props));

    _this.state = {
      contractSource: '',
      contractName: '',
      contracts: [],
      selectContract: {}
    };
    return _this;
  }

  _createClass(DApps, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      console.log('did mount');
      this.web3 = new _web2.default();
      this.web3.setProvider(new this.web3.providers.HttpProvider("http://localhost:8545"));
      this.web3.eth.defaultAccount = this.web3.eth.coinbase;
      //this.web3.eth.defaultAccount = this.web3.eth.accounts[1]
      console.log('coinbase: ' + this.web3.eth.coinbase);
      console.log('accounts0: ' + this.web3.eth.accounts[0]);
      //this.identity1 = this.web3.shh.newIdentity()
      //console.log(this.identity1)
      this.identity1 = '0x0487f24cf8e9cade4544cea73c4cc8145a68f0b3e00427b720df1594bf99f07f1f433ff969197c74f89e045369dfc4579bb0aa4bf062d0d8abb0849e164ee18a24';
      this.identity2 = '0x047ec47fd65d89c73d0c4bccf7351ee578ba4be52113bf10190674f71aba21e6ee35e1d9cd491018bb99a45367e4643ea47b80c6afa6bb0b8845f6c5bb7a183984';

      //this.web32 = new Web3()
      //this.web32.setProvider(new this.web32.providers.HttpProvider("http://localhost:8545"))
      //this.identity2 = this.web32.shh.newIdentity()
      //console.log(this.identity2)

      var contractSource = localStorage.getItem('contractSource');
      if (contractSource == null) {
        contractSource = '';
      }
      var contractName = localStorage.getItem('contractName');
      if (contractName == null) {
        contractName = '';
      }
      var contracts = localStorage.getItem('contracts');
      if (contracts == null) {
        contracts = [];
      } else {
        contracts = JSON.parse(contracts);
      }

      this.setState({ contractSource: contractSource, contractName: contractName, contracts: contracts });
    }
  }, {
    key: 'callback',
    value: function callback(err, contract) {
      if (err) {
        console.error(err);
        return;
        // callback fires twice, we only want the second call when the contract is deployed
      } else if (contract.address) {
        this.myContract = contract;
        console.log('address: ' + this.myContract.address);
      }
    }
  }, {
    key: 'handleClickx',
    value: function handleClickx() {
      var coinbase = this.web3.eth.coinbase;
      console.log(coinbase);
      var originalBalance = this.web3.eth.getBalance(coinbase).toNumber();
      console.log(originalBalance);

      /*
       let source = "" +
       "contract test {\n" +
       "   function multiply(uint a) constant returns(uint d) {\n" +
       "       return a * 7;\n" +
       "   }\n" +
       "}\n";
       */
      var source = "contract test { uint storedData = 0; function set(uint x) { storedData = storedData + x * 3; } function get() constant returns (uint retVal) { return storedData; }}";
      var compiled = this.web3.eth.compile.solidity(source);
      var code = compiled.test.code;
      // contract json abi, this is autogenerated using solc CLI
      var abi = compiled.test.info.abiDefinition;
      console.log(abi);

      //this.web3.eth.defaultAccount = this.web3.eth.coinbase;

      this.web3.eth.contract(abi).new({ data: code }, this.callback.bind(this));
    }
  }, {
    key: 'handleClick2x',
    value: function handleClick2x() {
      // api array
      // http://solidity.readthedocs.io/en/latest/contracts.html
      var ins = this.web3.eth.contract(this.myContract.abi).at(this.myContract.address);
      console.log(ins);
      ins.set(34);
      console.log(ins.get());
      var ret = ins.get();
      console.log(ret.toString(10));

      /*
       this.myContract.set(10)
       console.log(this.myContract.get())
       let ret = this.myContract.get()
       console.log(ret.toString(10))
       */
    }
  }, {
    key: 'handleClickxx',
    value: function handleClickxx() {
      var _this2 = this;

      /*
       this.web3.version.whisper
       let myIdentity = this.web3.shh.newIdentity()
       console.log(myIdentity)
       const appName = "test"
       var replyWatch = this.web3.shh.watch({
       "topic": [this.web3.fromAscii(appName), myIdentity],
       "to": myIdentity
       });
       replyWatch.arrived(function(m) {
       console.log("Reply from " + this.web3.toAscii(m.payload) + " whose address is " + m.from);
       });
       */

      //var replyWatch = this.web3.shh.watch({ "filter": [ this.web3.fromAscii(appName), this.web3.eth.accounts[0] ] });

      /*
       let appName = "My app!";
       var broadcastWatch = this.web3.shh.watch({ "filter": [ this.web3.fromAscii(appName) ] });
       broadcastWatch.arrived(function(m) {
       console.log(m)
       });
       */

      //console.log(this.web3.fromAscii('topic'))
      var filter = this.web32.shh.filter({ topics: ['topic'], to: this.identity2 });
      console.log('watch!!');
      console.log(filter);
      filter.watch(function (error, result) {
        if (error) {
          console.log(error);
        } else {
          console.log(_this2.web3.toAscii(result.payload));
          //console.log(result.payload)
        }
      });
      //filter.stopWatching()

      /*
       var filter = this.web3.eth.filter("latest").watch((e, blockHash) => {
       console.log(blockHash)
       this.web3.eth.getBlock(blockHash, (e, block) => {
       console.log(block.transactions)
       })
       this.web3.eth.getTransaction(transactionHash, (e, transaction) => {
       console.log(transaction)
       this.web3.eth.getTransactionReceipt(transactionHash, (e, receipt) => {
       console.log(receipt)
       /*
       if (e || !receipt || !transaction) return;
        var txId = Helpers.makeId('tx', transactionHash);
       if (receipt) {
       filter.stopWatching();
       }
       });
       });
       });
       */
    }
  }, {
    key: 'handleClick',
    value: function handleClick() {
      //this.web3.db.putString('korega', 'keyde', 'atai');
    }
  }, {
    key: 'handleClick2',
    value: function handleClick2() {
      //this.web3.shh.post({payload: "hi!!", topics: ["test"]})
      var appName = "My app!";

      //web3.shh.post({from:identity, topics:["topic"], payload: web3.fromAscii("test!!"), ttl: 100})
      this.web3.shh.post({
        from: this.identity1,
        to: this.identity2,
        topics: ['topic'],

        payload: this.web3.fromAscii('test!!'),
        //payload: 'test!!',
        ttl: 100
        //"priority": 1000
      }, function (a, b) {
        console.log(a);
        console.log(b);
      });
    }
  }, {
    key: 'handleClick3',
    value: function handleClick3(e) {
      //e.preventDefault();
      //
      //let customData = require('./test.json')
      //console.log(customData)

      //npm install fs-web --save

      //var fs = require('brfs');
      //var html = fs.readFileSync('./test.dat', 'utf8');
      // fs.readfile
      //fs.readFile('test.dat', 'utf', function(err, data) {})
      //console.log(text)
      //console.log(heredoc);

      //JSON.parse(localStorage.getItem('rmd'));
      // localStorage.setItem('rmd', JSON.stringify({value: initialVal}));
      //if (localStorage.getItem('test') === null) {
      //}
      //console.log(localStorage.getItem('test'))

      //localStorage.setItem('contractName', this.state.contractName)
      localStorage.setItem('contractSource', this.state.contractSource);

      var compiled = this.web3.eth.compile.solidity(this.state.contractSource);
      for (var name in compiled) {
        this.state.contracts.push({
          name: name, code: compiled[name].code,
          abi: JSON.stringify(compiled[name].info.abiDefinition)
        });
      }
      this.setState(this.state.contracts);
      console.log('compiled');
    }
  }, {
    key: 'handleClick4',
    value: function handleClick4() {
      console.log(this.abi);
      var abi = JSON.parse(this.abi);
      console.log(abi);

      //this.web3.eth.contract(abi).new({data: this.code}, ::this.callback);
    }
  }, {
    key: 'contractSourceChange',
    value: function contractSourceChange(e) {
      this.setState({ contractSource: e.target.value });
      //console.log(e.target.value)
    }
  }, {
    key: 'contractNameChange',
    value: function contractNameChange(e) {
      //this.setState({contractName: e.target.value})
    }
  }, {
    key: 'createContractCallback',
    value: function createContractCallback(err, contract) {
      if (err) {
        console.error(err);
      } else if (contract.address) {
        this.myContract = contract;
        console.log(contract);
        //console.log('address: ' + this.myContract.address)

        for (var i = 0; i < this.state.contracts.length; i++) {
          var abi = JSON.stringify(contract.abi);
          console.log(this.state.contracts[i].abi);
          console.log(abi);
          if (this.state.contracts[i].abi == abi) {
            this.state.contracts[i].address = contract.address;
            console.log(this.state.contracts[i].name + ' ' + i);
            console.log(contract);
            console.log(this.state.contracts[i].address);

            this.setState(this.state.contracts);

            localStorage.setItem('contracts', JSON.stringify(this.state.contracts));

            console.log(this.state.contracts);

            break;
          }
        }
      }
    }
  }, {
    key: 'createContractClick',
    value: function createContractClick(contract, e) {
      //from:web3.eth.accounts[0]
      this.web3.eth.contract(JSON.parse(contract.abi)).new({
        from: this.web3.eth.coinbase,
        data: contract.code,
        gas: 30000000
      }, this.createContractCallback.bind(this));
    }

    /*
     var contractInstance = MyContract.new(
     10,
     11,
     {from: myAccount, gas: 1000000}
     );
     */

  }, {
    key: 'callFunctionClick1',
    value: function callFunctionClick1(contract, e) {
      //var MyContract = this.web3.eth.contract(abiArray);
      //var contractInstance = MyContract.at([address]);
      var instance = this.web3.eth.contract(JSON.parse(contract.abi)).at(contract.address);
      console.log(instance);
      var ret = instance.multiply(100);
      console.log(ret.toString(10));
    }
  }, {
    key: 'callFunctionClick',
    value: function callFunctionClick(contract, e) {
      var instance = this.web3.eth.contract(JSON.parse(contract.abi)).at(contract.address);
      console.log(instance);

      var code = this.web3.eth.getCode(contract.address);
      console.log(code);
      console.log(typeof code === 'undefined' ? 'undefined' : _typeof(code));

      /*
      console.log(instance.addAbcList('0x11', 2, 'aaa', {from:this.web3.eth.accounts[0], gas:30000000}))
      console.log(instance.addAbcList('0x13', 5, 'bbb', {from:this.web3.eth.accounts[0], gas:30000000}))
      console.log(instance.addAbcList('0x15', 3, 'ccc', {from:this.web3.eth.accounts[0], gas:30000000}))
      */

      //console.log(instance.expireAbcList(4, {from:this.web3.eth.accounts[0], gas:30000000}))

      var hash = instance.kesu('0x13', { from: this.web3.eth.accounts[0], gas: 30000000 });

      var ret = instance.getAbcListSize();
      console.log(typeof ret === 'undefined' ? 'undefined' : _typeof(ret));
      console.log(ret);
      console.log(ret.toString(10));

      var len = ret.toNumber();
      for (var i = 0; i < len; i++) {
        ret = instance.abcList(i);
        console.log(ret);
        console.log(ret[0]);
        console.log(ret[1].toNumber());
        console.log(ret[2]);
      }

      console.log(instance.isAru('0x13', 5));
      console.log(instance.isAru('0x13', 6));

      // 50000000
      instance.kesu.estimateGas('0x13', function (error, result) {
        console.log('gas: ' + result);
      });
      console.log(instance.kesu.estimateGas('0x13', { from: this.web3.eth.accounts[0] }));
    }
  }, {
    key: 'callFunctionClickx',
    value: function callFunctionClickx(contract, e) {
      var instance = this.web3.eth.contract(JSON.parse(contract.abi)).at(contract.address);
      console.log(instance);
      //console.log(this.myContract)
      /*
       let ret = instance.createTest5(123456)
       console.log(ret.toString(10))
       console.log(ret.toString(16))
       */

      /*
       instance.set(123)
       ret = instance.get()
       console.log(typeof ret)
       console.log(ret)
        this.myContract.set(123)
       ret = this.myContract.get()
       console.log(typeof ret)
       console.log(ret)
       */

      /*
       this.myContract.set(456)
       ret = this.myContract.get()
       console.log(typeof ret)
       console.log(ret)
       console.log(ret.toString(10))
       */

      /*
       instance.set(123)
       let ret = instance.get();
       console.log(typeof ret)
       console.log(ret)
       console.log(ret.toString(10))
        ret = instance.issyo();
       console.log(typeof ret)
       console.log('issyo? ' + ret)
        ret = instance.getCreator();
       console.log(typeof ret)
       console.log(ret)
       ret = instance.getSender();
       console.log(typeof ret)
       console.log(ret)
       */

      var code = this.web3.eth.getCode(contract.address);
      console.log(code);

      try {
        /*
        let ret = instance.setStr('abc')
        console.log(typeof ret)
        console.log(ret)
        ret = instance.getStr();
        console.log(typeof ret)
        console.log(ret)
         ret = instance.callTest5();
        console.log(typeof ret)
        console.log(ret)
        console.log(ret.toString(10))
        */

        //instance.callTest52(15, {from:this.web3.eth.accounts[0], gas:30000000})

        //console.log(instance.test5Addr());
        //console.log(instance.creator());

        //instance.destroyTest5({from:this.web3.eth.accounts[0], gas:30000000})

        /*
         for (let i = 0; i < this.state.contracts.length; i++) {
         if (this.state.contracts[i].name == 'Test5') {
         let instance = this.web3.eth.contract(JSON.parse(this.state.contracts[i].abi)).at('0x8c28debee88808d71fc11ba1e81b5420cb27d350');
         console.log(instance)
         ret = instance.getId()
         console.log(typeof ret)
         console.log(ret)
         console.log(ret.toString(10))
          instance.setId(6421, {from:this.web3.eth.accounts[0], gas:30000000})
         }
         }
         */

        //0x917a4612736674510d150b9bdb9319fa35262e05

        //console.log(instance.setId(1234));
        var ret = instance.getId();
        console.log(typeof ret === 'undefined' ? 'undefined' : _typeof(ret));
        console.log(ret);
        console.log(ret.toString(10));

        //console.log(instance.callTest523('0x917a4612736674510d150b9bdb9319fa35262e05', 5678, {from:this.web3.eth.accounts[0], gas:30000000}))
      } catch (err) {
        console.log(err);
      }
    }
  }, {
    key: 'watch',
    value: function watch(event) {
      console.log('watching');
      event.watch(function (error, result) {
        console.log('watching "Print" event!');
        if (!error) {
          console.log(result);
          //this.watch(event)
        } else {
          console.log(error);
        }
      });
    }
  }, {
    key: 'watchContractClick',
    value: function watchContractClick(contract, e) {
      var test = this.web3.eth.contract(JSON.parse(contract.abi)).at(contract.address);
      var event = test.Print();
      this.watch(event);
      //event = test.PrintAddress()
      //this.watch(event)

      var events = contractInstance.allEvents();
      events.watch(function (error, event) {
        if (!error) {
          Session.set("contractState", event.event);
        }
      });
    }
  }, {
    key: 'killContractClick',
    value: function killContractClick(contract, e) {
      var test = this.web3.eth.contract(JSON.parse(contract.abi)).at(contract.address);
      test.kill();
      console.log('kill');
    }
  }, {
    key: 'contractsClick',
    value: function contractsClick(contract, e) {
      /*
       if (contract.address) {
       this.setState({selectContract: contract})
       let abiArray = JSON.parse(contract.abi);
       for (let i = 0; i < abiArray.length; i++) {
       if (abiArray[i].type === 'function') {
       console.log(abiArray[i].name);
       for (let j = 0; j < abiArray[i].inputs.length; j++) {
       console.log(abiArray[i].inputs[j].type);
       console.log(abiArray[i].inputs[j].name);
       }
       for (let j = 0; j < abiArray[i].outputs.length; j++) {
       console.log(abiArray[i].outputs[j].type);
       console.log(abiArray[i].outputs[j].name);
       }
       }
       }
       }
       */
    }
  }, {
    key: 'testClick',
    value: function testClick() {
      /*
      var filter = this.web3.eth.filter("latest").watch((e, blockHash) => {
        console.log('block: ' + blockHash)
        this.web3.eth.getBlock(blockHash, (e, block) => {
          //console.log(block.transactions)
           for (let i in block.transactions) {
            console.log('tran: ' + block.transactions[i])
          }
        })
      })
      */

      console.log(this.web3.eth.getTransactionReceipt("0x554880ee9001fd327e8c88f4d3061dfb3cbf3321336b0179828155e23cbca924"));
    }
  }, {
    key: 'renderx',
    value: function renderx() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { controlId: 'formControlsTextarea' },
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Contract source'
          ),
          _react2.default.createElement(_reactBootstrap.FormControl, { componentClass: 'textarea', rows: '20', placeholder: 'Enter contract source',
            value: this.state.contractSource, onChange: this.contractSourceChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          { bsStyle: 'primary', onClick: this.handleClick3.bind(this) },
          'Compile contract'
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      //const contractRows = Object.keys(this.state.contracts).map(name => {
      var contractRows = [];
      for (var i = 0; i < this.state.contracts.length; i++) {
        var contract = this.state.contracts[i];
        var code = contract.code;
        if (code.length > 10) {
          code = code.substring(0, 10) + '... ' + code.length;
        }
        var abi = contract.abi;
        if (abi.length > 50) {
          //abi = abi.substring(0, 50) + '... '
        }

        contractRows.push(_react2.default.createElement(
          'tr',
          { key: i, onClick: this.contractsClick.bind(this, contract) },
          _react2.default.createElement(
            'td',
            null,
            contract.name
          ),
          _react2.default.createElement(
            'td',
            null,
            code
          ),
          _react2.default.createElement(
            'td',
            null,
            abi
          ),
          _react2.default.createElement(
            'td',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'info', onClick: this.createContractClick.bind(this, contract) },
              'Create contract'
            )
          ),
          _react2.default.createElement(
            'td',
            null,
            contract.address
          ),
          _react2.default.createElement(
            'td',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'warning', onClick: this.callFunctionClick.bind(this, contract) },
              'Call function'
            )
          ),
          _react2.default.createElement(
            'td',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'warning', onClick: this.watchContractClick.bind(this, contract) },
              'Watch'
            )
          ),
          _react2.default.createElement(
            'td',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'warning', onClick: this.killContractClick.bind(this, contract) },
              'Kill'
            )
          )
        ));
      }

      var contractForm = void 0;
      /*
       if (this.state.selectContract.address) {
       let contract = this.state.selectContract
        let abiArray = JSON.parse(contract.abi)
       for (let i = 0; i < abiArray.length; i++) {
       if (abiArray[i].type === 'function') {
       console.log(abiArray[i].name)
       for (let j = 0; j < abiArray[i].inputs.length; j++) {
       console.log(abiArray[i].inputs[j].type)
       console.log(abiArray[i].inputs[j].name)
       }
       for (let j = 0; j < abiArray[i].outputs.length; j++) {
       console.log(abiArray[i].outputs[j].type)
       console.log(abiArray[i].outputs[j].name)
       }
       }
       }
       }
       */

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { controlId: 'formControlsTextarea' },
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Contract source'
          ),
          _react2.default.createElement(_reactBootstrap.FormControl, { componentClass: 'textarea', rows: '20', placeholder: 'Enter contract source',
            value: this.state.contractSource, onChange: this.contractSourceChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          { bsStyle: 'primary', onClick: this.handleClick3.bind(this) },
          'Compile contract'
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          { bsStyle: 'primary', onClick: this.testClick.bind(this) },
          'Test'
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          { bsStyle: 'primary', onClick: this.handleClick.bind(this) },
          'Test1'
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          { bsStyle: 'primary', onClick: this.handleClick2.bind(this) },
          'Test2'
        ),
        _react2.default.createElement(
          _reactBootstrap.Table,
          { striped: true, bordered: true, condensed: true, hover: true },
          _react2.default.createElement(
            'thead',
            null,
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement(
                'th',
                null,
                'name'
              ),
              _react2.default.createElement(
                'th',
                null,
                'code'
              ),
              _react2.default.createElement(
                'th',
                null,
                'abi'
              ),
              _react2.default.createElement(
                'th',
                null,
                'create'
              ),
              _react2.default.createElement(
                'th',
                null,
                'address'
              ),
              _react2.default.createElement(
                'th',
                null,
                'address'
              ),
              _react2.default.createElement(
                'th',
                null,
                'watch'
              ),
              _react2.default.createElement('th', null)
            )
          ),
          _react2.default.createElement(
            'tbody',
            null,
            contractRows
          )
        ),
        contractForm
      );
    }
  }]);

  return DApps;
}(_react.Component);

(0, _reactDom.render)(_react2.default.createElement(DApps, null), document.getElementById('root'));