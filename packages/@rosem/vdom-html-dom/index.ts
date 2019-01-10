import Host from './Host'
import VHost from './VHost'

export const host = new Host()

export const vHost = new VHost(host)

export const h = vHost.hyperScript.bind(vHost)
