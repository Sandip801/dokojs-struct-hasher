import React, { useState, useEffect } from 'react';
import {
  Hash,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Shield,
  Code2,
  ChevronDown,
  Network as NetworkIcon,
} from 'lucide-react';

/** Algorithms & outputs (plain JS) */
const ALGORITHMS = [
  'bhp256', 'bhp512', 'bhp768', 'bhp1024',
  'keccak256', 'keccak384', 'keccak512',
  'ped64', 'ped128',
  'sha3_256', 'sha3_384', 'sha3_512'
];

const OUTPUTS = [
  'address', 'boolean', 'field', 'group',
  'i8', 'i16', 'i32', 'i64', 'i128',
  'u8', 'u16', 'u32', 'u64', 'u128',
  'scalar'
];

/* ----------------------------- Contract catalogs ----------------------------- */

// Contract choices
const CONTRACT_OPTIONS = [
  { value: 'council', label: 'Council' },
  { value: 'bridgeCouncil', label: 'Bridge Council' },
  { value: 'tokenServiceCouncil', label: 'Token Service (Walaeo Council)' },
];

const isFixedByteArray = (t) => /^\[u8;\s*\d+u32\]$/.test(t);

/** Minimal safe defaults for each type */
const defaultForType = (type) => {
  if (type === 'field') return '123456';
  if (type === 'boolean') return 'true';
  if (type === 'address') return 'aleo1qnr4dkkvkgfqph0vzc3y6z2eu975wnpz2925ntjccd5cfqxtyu8sta57j8';
  if (type === 'u8') return '1';
  if (type === 'u16') return '100';
  if (type === 'u32') return '1000';
  if (type === 'u64') return '10000';
  if (type === 'u128') return '100000';
  if (type === 'i8') return '1';
  if (type === 'i16') return '100';
  if (type === 'i32') return '1000';
  if (type === 'i64') return '10000';
  if (type === 'i128') return '100000';
  if (type === 'scalar') return '123456';
  if (type === 'group') return '1group';
  if (isFixedByteArray(type)) return '[]'; // user can paste exact length later
  return '0';
};

// Ensures address values are wrapped in quotes; arrays pass through; numbers get suffixes
const formatLiteral = (type, value) => {
  if (type === 'address') {
    // const unquoted = String(value).replace(/^"(.*)"$/, '$1');
    return `${value}`;
  }
  if (type === 'field') return `${value}field`;
  if (type === 'boolean') return `${value}`;
  if (isFixedByteArray(type)) return `${value}`; // expect [1u8,2u8,...]
  return `${value}${type}`; // i/u ints, scalar, group, etc.
};

// --- Council structs ---
const STRUCTS_COUNCIL = {
  AddMember: {
    name: 'AddMember', description: 'Add multisig member', category: 'Council',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') },
      id: { type: 'u32', default: defaultForType('u32') },
      new_member: { type: 'address', default: defaultForType('address') },
      new_threshold: { type: 'u8', default: defaultForType('u8') },
    },
  },
  RemoveMember: {
    name: 'RemoveMember', description: 'Remove multisig member', category: 'Council',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') },
      id: { type: 'u32', default: defaultForType('u32') },
      existing_member: { type: 'address', default: defaultForType('address') },
      new_threshold: { type: 'u8', default: defaultForType('u8') },
    },
  },
  Withdrawal: {
    name: 'Withdrawal', description: 'Treasury withdrawal', category: 'Council',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') },
      id: { type: 'u32', default: defaultForType('u32') },
      token_id: { type: 'field', default: defaultForType('field') },
      receiver: { type: 'address', default: defaultForType('address') },
      amount: { type: 'u128', default: defaultForType('u128') },
    },
  },
  UpdateThreshold: {
    name: 'UpdateThreshold', description: 'Update multisig threshold', category: 'Council',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') },
      id: { type: 'u32', default: defaultForType('u32') },
      new_threshold: { type: 'u8', default: defaultForType('u8') },
    },
  },
  ExternalProposal: {
    name: 'ExternalProposal', description: 'External program proposal', category: 'Council',
    fields: {
      id: { type: 'u32', default: defaultForType('u32') },
      external_program: { type: 'address', default: defaultForType('address') },
      proposal_hash: { type: 'field', default: defaultForType('field') },
    },
  },
};

// --- Bridge Council structs ---
const STRUCTS_BRIDGE_COUNCIL = {

  TbTransferOwnership: {
    name: 'TbTransferOwnership', description: 'Transfer bridge ownership', category: 'Bridge Council',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') },
      id: { type: 'u32', default: defaultForType('u32') },
      new_owner: { type: 'address', default: defaultForType('address') },
    },
  },
  TbAddAttestor: {
    name: 'TbAddAttestor', description: 'Add attestor', category: 'Bridge Council',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') },
      id: { type: 'u32', default: defaultForType('u32') },
      new_attestor: { type: 'address', default: defaultForType('address') },
      new_threshold: { type: 'u8', default: defaultForType('u8') },
    },
  },
  TbRemoveAttestor: {
    name: 'TbRemoveAttestor', description: 'Remove attestor', category: 'Bridge Council',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') },
      id: { type: 'u32', default: defaultForType('u32') },
      existing_attestor: { type: 'address', default: defaultForType('address') },
      new_threshold: { type: 'u8', default: defaultForType('u8') },
    },
  },
  TbUpdateThreshold: {
    name: 'TbUpdateThreshold', description: 'Update threshold', category: 'Bridge Council',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, new_threshold: { type: 'u8', default: defaultForType('u8') } },
  },
  TbAddChain: {
    name: 'TbAddChain', description: 'Add chain', category: 'Bridge Council',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, chain_id: { type: 'u128', default: defaultForType('u128') } },
  },
  TbRemoveChain: {
    name: 'TbRemoveChain', description: 'Remove chain', category: 'Bridge Council',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, chain_id: { type: 'u128', default: defaultForType('u128') } },
  },
  TbAddService: {
    name: 'TbAddService', description: 'Add service', category: 'Bridge Council',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, service: { type: 'address', default: defaultForType('address') } },
  },
  TbRemoveService: {
    name: 'TbRemoveService', description: 'Remove service', category: 'Bridge Council',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, service: { type: 'address', default: defaultForType('address') } },
  },
  TbPause: { name: 'TbPause', description: 'Pause', category: 'Bridge Council', fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') } } },
  TbUnpause: { name: 'TbUnpause', description: 'Unpause', category: 'Bridge Council', fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') } } },
};

// --- Token Service (Walaeo Council) structs ---
const STRUCTS_TOKEN_SERVICE = {

  TsTransferOwnership: {
    name: 'TsTransferOwnership', description: 'Transfer TS ownership', category: 'Token Service',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, new_owner: { type: 'address', default: defaultForType('address') } },
  },
  TsAddTokenInfo: {
    name: 'TsAddTokenInfo', description: 'Add token info', category: 'Token Service',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') },
      min_transfer: { type: 'u64', default: defaultForType('u64') }, max_transfer: { type: 'u64', default: defaultForType('u64') },
      token_address: { type: '[u8; 20u32]', default: defaultForType('[u8; 20u32]') },
      token_service: { type: '[u8; 20u32]', default: defaultForType('[u8; 20u32]') },
      chain_id: { type: 'u128', default: defaultForType('u128') },
      fee_platform: { type: 'u32', default: defaultForType('u32') },
    },
  },
  TsUpdateMaxMinTransfer: {
    name: 'TsUpdateMaxMinTransfer', description: 'Update max/min', category: 'Token Service',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') },
      chain_id: { type: 'u128', default: defaultForType('u128') },
      max_transfer: { type: 'u64', default: defaultForType('u64') }, min_transfer: { type: 'u64', default: defaultForType('u64') },
    },
  },
  TsPauseToken: { name: 'TsPauseToken', description: 'Pause token by chain', category: 'Token Service', fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, chain_id: { type: 'u128', default: defaultForType('u128') } } },
  TsUnpauseToken: { name: 'TsUnpauseToken', description: 'Unpause token by chain', category: 'Token Service', fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, chain_id: { type: 'u128', default: defaultForType('u128') } } },
  HoldingRelease: {
    name: 'HoldingRelease', description: 'Release holding', category: 'Token Service',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, receiver: { type: 'address', default: defaultForType('address') }, amount: { type: 'u64', default: defaultForType('u64') } },
  },
  TransferOwnershipHolding: {
    name: 'TransferOwnershipHolding', description: 'Transfer ownership holding', category: 'Token Service',
    fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, new_owner: { type: 'address', default: defaultForType('address') } },
  },
  UpdateTokenServiceSetting: {
    name: 'UpdateTokenServiceSetting', description: 'Update TS settings', category: 'Token Service',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') },
      chain_id: { type: 'u128', default: defaultForType('u128') },
      token_service_address: { type: '[u8; 20u32]', default: defaultForType('[u8; 20u32]') },
      token_address: { type: '[u8; 20u32]', default: defaultForType('[u8; 20u32]') },
    },
  },
  AddChainExistingToken: {
    name: 'AddChainExistingToken', description: 'Add existing token on chain', category: 'Token Service',
    fields: {
      tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') },
      chain_id: { type: 'u128', default: defaultForType('u128') },
      token_service_address: { type: '[u8; 20u32]', default: defaultForType('[u8; 20u32]') },
      token_address: { type: '[u8; 20u32]', default: defaultForType('[u8; 20u32]') },
      fee_platform: { type: 'u32', default: defaultForType('u32') },
    },
  },
  RemoveOtherChainAddresses: { name: 'RemoveOtherChainAddresses', description: 'Remove other-chain addresses', category: 'Token Service', fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, chain_id: { type: 'u128', default: defaultForType('u128') } } },
  UpdateFees: { name: 'UpdateFees', description: 'Update platform fees', category: 'Token Service', fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, chain_id: { type: 'u128', default: defaultForType('u128') }, fee_platform: { type: 'u32', default: defaultForType('u32') } } },
  WithdrawalCreditsFees: { name: 'WithdrawalCreditsFees', description: 'Withdraw credits & fees', category: 'Token Service', fields: { tag: { type: 'u8', default: defaultForType('u8') }, id: { type: 'u32', default: defaultForType('u32') }, receiver: { type: 'address', default: defaultForType('address') }, amount: { type: 'u64', default: defaultForType('u64') } } },
};

// Registry
const CONTRACT_STRUCTS = {
  council: STRUCTS_COUNCIL,
  bridgeCouncil: STRUCTS_BRIDGE_COUNCIL,
  tokenServiceCouncil: STRUCTS_TOKEN_SERVICE,
};

/* --------------------------------- Component -------------------------------- */

const DokoHashingPage = () => {
  // WASM state
  const [dokoWasm, setDokoWasm] = useState(null);
  const [wasmError, setWasmError] = useState('');

  // Config pickers
  const [contractKind, setContractKind] = useState('council'); // 'council' | 'bridgeCouncil' | 'tokenServiceCouncil'
  const [selectedStruct, setSelectedStruct] = useState('TokenMetadata');
  const [structValues, setStructValues] = useState({});

  const [algorithm, setAlgorithm] = useState('bhp256');
  const [outputType, setOutputType] = useState('field');
  const [network, setNetwork] = useState('testnet');

  const [hashedValue, setHashedValue] = useState('');
  const [inputStruct, setInputStruct] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Robust loader for @doko-js/wasm
   */
  useEffect(() => {
    let mounted = true;
    const initWasm = async () => {
      try {
        const mod = await import('@doko-js/wasm');

        const tryUrl = (path) => {
          try { return new URL(path, import.meta.url); } catch { return undefined; }
        };

        if (mod && typeof mod.default === 'function') {
          try {
            await mod.default();
          } catch {
            const guessPaths = [
              '@doko-js/wasm/dist/pkg-web_bg.wasm',
              '@doko-js/wasm/pkg-web_bg.wasm',
              '@doko-js/wasm/wasm_bg.wasm'
            ];
            let initialized = false;
            for (const p of guessPaths) {
              const maybeUrl = tryUrl(p);
              if (!maybeUrl) continue;
              try { await mod.default(maybeUrl); initialized = true; break; } catch {}
            }
            if (!initialized) await mod.default();
          }
        } else if (mod && typeof mod.init === 'function') {
          try { await mod.init(); }
          catch {
            const maybeUrl = tryUrl('@doko-js/wasm/dist/pkg-web_bg.wasm');
            if (maybeUrl) await mod.init(maybeUrl);
          }
        } else if (mod && mod.default && typeof mod.default.init === 'function') {
          await mod.default.init();
        }

        const ns =
          (mod && mod.Hasher) ? mod :
          (mod && mod.default && mod.default.Hasher) ? mod.default :
          null;

        if (!ns || !ns.Hasher || typeof ns.Hasher.hash !== 'function') {
          throw new Error('Failed to find Hasher.hash export after init');
        }
        if (mounted) { setDokoWasm(ns); setWasmError(''); }
      } catch (e) {
        console.error('Doko WASM init failed:', e);
        if (mounted) { setDokoWasm(null); setWasmError((e && e.message) ? e.message : 'Failed to initialize @doko-js/wasm'); }
      }
    };
    initWasm();
    return () => { mounted = false; };
  }, []);

  // Current contract structs
  const getAllStructsForContract = () => CONTRACT_STRUCTS[contractKind] || STRUCTS_COUNCIL;

  // Current struct object
  const getCurrentStruct = () => {
    const all = getAllStructsForContract();
    return all[selectedStruct] || all.TokenMetadata;
  };

  // Initialize struct field defaults when contract or struct changes
  useEffect(() => {
    const all = getAllStructsForContract();
    const current = all[selectedStruct] || all.TokenMetadata;
    if (current) {
      const initialValues = {};
      Object.keys(current.fields).forEach((field) => {
        initialValues[field] = current.fields[field].default;
      });
      setStructValues(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStruct, contractKind]);

  // Convert current struct to Aleo/DokoJS input literal (untyped object)
  const convertToDokoJSFormat = () => {
    const current = getCurrentStruct();
    const structFields = [];
    Object.keys(current.fields).forEach((fieldName) => {
      const fieldDef = current.fields[fieldName];
      const value = structValues[fieldName] ?? fieldDef.default;
      structFields.push(`${fieldName}: ${formatLiteral(fieldDef.type, value)}`);
    });
    return `{${structFields.join(', ')}}`;
  };

  // Preview string (same as above)
  const generateStructString = () => convertToDokoJSFormat();

  // REAL hashing (WASM)
  const hashStructWithDokoJS = (algorithmParam, outputTypeParam, networkParam) => {
    if (!dokoWasm || !dokoWasm.Hasher || typeof dokoWasm.Hasher.hash !== 'function') {
      throw new Error('WASM Hasher not ready');
    }
    const structString = convertToDokoJSFormat();
    const hash = dokoWasm.Hasher.hash(algorithmParam, structString, outputTypeParam, networkParam);
    return { inputStruct: structString, algorithm: algorithmParam, outputType: outputTypeParam, network: networkParam, hash };
  };

  const handleHash = async () => {
    setIsHashing(true);
    try {
      await new Promise((res) => setTimeout(res, 150)); // small UX delay
      const result = hashStructWithDokoJS(algorithm, outputType, network);
      setInputStruct(result.inputStruct);
      setHashedValue(result.hash);
    } catch (error) {
      console.error('Hashing failed:', error);
      setHashedValue('');
      setInputStruct('');
    } finally {
      setIsHashing(false);
    }
  };

  const handleCopy = async () => {
    if (!hashedValue) return;
    try {
      await navigator.clipboard.writeText(hashedValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const updateFieldValue = (fieldName, value) => {
    setStructValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const currentStruct = getCurrentStruct();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DokoJS WASM Struct Hasher</h1>
              <p className="text-blue-200 text-sm">Official DokoJS Hasher.hash() implementation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Hashing Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Build Struct & Generate Hash</h2>
              </div>

              <div className="space-y-6">
                {/* Contract Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Contract
                  </label>
                  <div className="relative">
                    <select
                      value={contractKind}
                      onChange={(e) => {
                        const next = e.target.value;
                        setContractKind(next);
                        setSelectedStruct('TokenMetadata'); // reasonable default available in all
                      }}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                    >
                      {CONTRACT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-gray-800">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Contract: {CONTRACT_OPTIONS.find(o => o.value === contractKind)?.label}
                  </p>
                </div>

                {/* Struct Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Struct Type
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStruct}
                      onChange={(e) => setSelectedStruct(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                    >
                      {Object.keys(getAllStructsForContract()).map((structName) => (
                        <option key={structName} value={structName} className="bg-gray-800">
                          {structName} - {getAllStructsForContract()[structName].description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Category: {currentStruct.category}
                  </p>
                </div>

                {/* Algorithm / Output / Network pickers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Algorithm</label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ALGORITHMS.map((a) => (
                        <option key={a} value={a} className="bg-gray-800">{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Output Type</label>
                    <select
                      value={outputType}
                      onChange={(e) => setOutputType(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {OUTPUTS.map((o) => (
                        <option key={o} value={o} className="bg-gray-800">{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="testnet" className="bg-gray-800">testnet</option>
                      <option value="mainnet" className="bg-gray-800">mainnet</option>
                    </select>
                  </div>
                </div>
                {wasmError && <p className="text-red-400 text-xs">{wasmError}</p>}
                {!dokoWasm && !wasmError && <p className="text-gray-400 text-xs">Loading DokoJS WASM…</p>}

                {/* Dynamic Field Inputs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Struct Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(currentStruct.fields).map((fieldName) => {
                      const fieldDef = currentStruct.fields[fieldName];
                      const options = fieldDef.options || (fieldDef.type === 'boolean' ? ['true','false'] : null);
                      return (
                        <div key={fieldName} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {fieldName}
                            <span className="text-xs text-blue-400 ml-2">({fieldDef.type})</span>
                          </label>
                          {options ? (
                            <div className="relative">
                              <select
                                value={structValues[fieldName] ?? fieldDef.default}
                                onChange={(e) => updateFieldValue(fieldName, e.target.value)}
                                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
                              >
                                {options.map((option) => (
                                  <option key={option} value={option} className="bg-gray-800">
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={structValues[fieldName] ?? fieldDef.default}
                              onChange={(e) => updateFieldValue(fieldName, e.target.value)}
                              placeholder={fieldDef.placeholder || fieldDef.type}
                              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            />
                          )}
                          {isFixedByteArray(fieldDef.type) && (
                            <p className="text-[11px] text-gray-400">
                              Expect Aleo array literal, e.g. <code className="text-gray-300">[0u8,1u8,...]</code>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Generated Struct Preview */}
                <div className="p-4 bg-black/30 rounded-xl border border-white/20">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Preview Struct:</h4>
                  <div className="bg-black/50 rounded-lg p-3">
                    <code className="text-blue-300 font-mono text-xs break-all block">
                      {generateStructString()}
                    </code>
                  </div>
                </div>

                {/* DokoJS Input Format */}
                {inputStruct && (
                  <div className="p-4 bg-black/30 rounded-xl border border-white/20">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">DokoJS Input Format:</h4>
                    <div className="bg-black/50 rounded-lg p-3">
                      <code className="text-yellow-300 font-mono text-xs break-all block">
                        {inputStruct}
                      </code>
                    </div>
                  </div>
                )}

                {/* Hash Button */}
                <button
                  onClick={handleHash}
                  disabled={isHashing || !dokoWasm}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isHashing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Hashing…
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate Hash
                    </>
                  )}
                </button>

                {/* Output Section */}
                {hashedValue && (
                  <div className="mt-6 space-y-4">
                    {/* Hash Result */}
                    <div className="p-6 bg-black/30 rounded-2xl border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">DokoJS Hash Result</h3>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">
                          Algorithm: {algorithm.toUpperCase()} | Output: {outputType} | Network: {network}
                        </div>
                        <code className="text-green-300 font-mono text-sm break-all block">
                          {hashedValue}
                        </code>
                      </div>
                    </div>


                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">DokoJS Configuration</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-black/30 rounded-lg border border-white/10">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-blue-300 text-sm">Library</h4>
                      <p className="text-green-300 font-mono">@doko-js/wasm</p>
                      <p className="text-gray-400 text-xs mt-1">DokoJS WebAssembly hashing</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-300 text-sm">Contract</h4>
                      <p className="text-green-300 font-mono">{CONTRACT_OPTIONS.find(o => o.value === contractKind)?.label}</p>
                      <p className="text-gray-400 text-xs mt-1">Preset struct catalog</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-300 text-sm">Struct</h4>
                      <p className="text-green-300 font-mono">{selectedStruct}</p>
                      <p className="text-gray-400 text-xs mt-1">{currentStruct.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-300 text-sm">Algorithm</h4>
                      <p className="text-green-300 font-mono">{algorithm.toUpperCase()}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-300 text-sm">Output Type</h4>
                      <p className="text-green-300 font-mono">{outputType}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-300 text-sm">Network</h4>
                      <p className="text-green-300 font-mono">{network}</p>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-orange-300 text-xs">🌐 Uses real DokoJS WASM interface</p>
                    </div>
                  </div>
                </div>
                {dokoWasm && dokoWasm.Hasher && dokoWasm.Hasher.hash && (
                  <div className="text-xs text-green-400">✅ WASM ready</div>
                )}
                {wasmError && <div className="text-xs text-red-400">⚠️ {wasmError}</div>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DokoHashingPage;
