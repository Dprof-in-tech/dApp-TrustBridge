export interface PasskeyCredential {
  id: string
  rawId: ArrayBuffer
  response: {
    clientDataJSON: ArrayBuffer
    attestationObject: ArrayBuffer
  }
  type: string
}

export interface PasskeyAssertion {
  id: string
  rawId: ArrayBuffer
  response: {
    clientDataJSON: ArrayBuffer
    authenticatorData: ArrayBuffer
    signature: ArrayBuffer
    userHandle: ArrayBuffer | null
  }
  type: string
}
