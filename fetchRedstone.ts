import { ContractParamsProvider } from '@redstone-finance/sdk';
import http from 'node:http';
import https from 'node:https';

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
    dataPackagesIds: ['BTC', 'ETH'],
    uniqueSignersCount: 2,
  });
  const dataPackages = await cpp.requestDataPackages();
  const payloadHex = await cpp.getPayloadData();
  const hexlified = cpp.getHexlifiedFeedIds();
  const dataFeedIds = cpp.getDataFeedIds();
  console.log('🚀 ~ main ~ dataPackages: ', dataPackages);
  console.log('🚀 ~ main ~ payloadBytes: ', payloadHex);
  console.log('🚀 ~ main ~ hexlified: ', hexlified);
  console.log('🚀 ~ main ~ feedIds: ', dataFeedIds);
}

main().catch(console.error);
