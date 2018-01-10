﻿import { System_String } from './Platform/Platform';
import { platform } from './Environment';
import { internalRegisteredFunctions } from './InternalRegisteredFunction';

const registeredFunctions: { [identifier: string]: Function | undefined } = {};

export function registerFunction(identifier: string, implementation: Function) {
  if (internalRegisteredFunctions.hasOwnProperty(identifier)) {
    throw new Error(`The function identifier '${identifier}' is reserved and cannot be registered.`);
  }

  if (registeredFunctions.hasOwnProperty(identifier)) {
    throw new Error(`A function with the identifier '${identifier}' has already been registered.`);
  }

  registeredFunctions[identifier] = implementation;
}

export function getRegisteredFunction(identifier: string): Function {
  // By prioritising the internal ones, we ensure you can't override them
  const result = internalRegisteredFunctions[identifier] || registeredFunctions[identifier];
  if (result) {
    return result;
  } else {
    throw new Error(`Could not find registered function with name '${identifier}'.`);
  }
}

export function invokeWithJsonMarshalling(identifier: System_String, ...argsJson: System_String[]) {
  const identifierJsString = platform.toJavaScriptString(identifier);
  const funcInstance = getRegisteredFunction(identifierJsString);
  const args = argsJson.map(json => JSON.parse(platform.toJavaScriptString(json)));
  const result = funcInstance.apply(null, args);
  if (result !== null && result !== undefined) {
    const resultJson = JSON.stringify(result);
    return platform.toDotNetString(resultJson);
  } else {
    return null;
  }
}
