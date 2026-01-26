import { expect, afterEach } from 'vitest'
import * as matchers from '@vitest/browser/matchers'
import { cleanup } from 'vitest-browser-svelte'

expect.extend(matchers)

afterEach(() => {
    cleanup()
})
