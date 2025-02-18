import http from 'node:http';
import https from 'node:https';
import { ContractParamsProvider } from '@redstone-finance/sdk';

const originalHttpRequest = http.request;
http.request = function (...args) {
  console.log('🚀 ~ http.request ~ args: ', args);
  console.log(
    'HTTP Request:',
    `${args[0]?.protocol}//${args[0]?.hostname}${args[0]?.path}`
  );
  return originalHttpRequest.apply(this, args);
};

const originalHttpsRequest = https.request;
https.request = function (...args) {
  console.log('🚀 ~ http.request ~ args: ', args);
  console.log(
    'HTTPS Request:',
    `${args[0]?.protocol}//${args[0]?.hostname}${args[0]?.path}`
  );
  return originalHttpsRequest.apply(this, args);
};

async function main() {
  const cpp: ContractParamsProvider = new ContractParamsProvider({
    dataServiceId: 'redstone-primary-prod',
    dataPackagesIds: [
      'ETH',
      'ezETH',
      'USDC',
      'USDT',
      // 'FUEL',
      'sDAI',
      'weETH',
      'wstETH',
    ],
    uniqueSignersCount: 1,
  });
  const dataPackages = await cpp.requestDataPackages();
  const payloadHex = await cpp.getPayloadData();
  const hexlified = cpp.getHexlifiedFeedIds();
  const dataFeedIds = cpp.getDataFeedIds();
  console.log('🚀 ~ main ~ payloadBytes: ', payloadHex.toString());
  console.log('🚀 ~ main ~ hexlified: ', hexlified);
  console.log('🚀 ~ main ~ feedIds: ', dataFeedIds);
}

main().catch(console.error);
