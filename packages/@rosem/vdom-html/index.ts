import Host from './Host'
import VHost from '@rosem/vdom/VHost'
import HostInterface from '@rosem/vdom/HostInterface'

export const host: HostInterface<Node, Element, Text, Comment> = new Host()

export const vHost = new VHost()

export const h = vHost.createVirtualNode
