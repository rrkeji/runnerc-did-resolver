import fetch from 'cross-fetch'
import { DIDDocument, DIDResolutionResult, DIDResolver, ParsedDID } from 'did-resolver'

const RUNNERC_HOST = 'did.runnerc.cc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function get(url: string): Promise<any> {
  const res = await fetch(url, { mode: 'cors' })
  if (res.status >= 400) {
    throw new Error(`Bad response ${res.statusText}`)
  }
  return res.json()
}

export function getResolver(): Record<string, DIDResolver> {
  async function resolve(did: string, parsed: ParsedDID): Promise<DIDResolutionResult> {
    //
    let err = null
    console.log("did:", did)
    console.log("ParsedDID:", parsed)
    // get runnerc url
    const url = `https://${RUNNERC_HOST}/resolver/${did}/did.json`

    const didDocumentMetadata = {}
    let didDocument: DIDDocument | null = null

    do {
      try {
        //
        console.log("get url is:", url)
        didDocument = await get(url)
      } catch (error) {
        err = `resolver_error: DID must resolve to a valid https URL containing a JSON document: ${error}`
        break
      }

      // TODO: this excludes the use of query params
      const docIdMatchesDid = didDocument?.id === did
      if (!docIdMatchesDid) {
        err = 'resolver_error: DID document id does not match requested did'
        // break // uncomment this when adding more checks
      }
      // eslint-disable-next-line no-constant-condition
    } while (false)

    const contentType =
      typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json'

    if (err) {
      return {
        didDocument,
        didDocumentMetadata,
        didResolutionMetadata: {
          error: 'notFound',
          message: err,
        },
      }
    } else {
      return {
        didDocument,
        didDocumentMetadata,
        didResolutionMetadata: { contentType },
      }
    }
  }

  return { runnerc: resolve }
}
