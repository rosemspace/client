import Host from './Host'
import VHost from '@rosem/vdom/VHost'
import HostInterface from '@rosem/vdom/HostInterface'

const host: HostInterface<Node, Comment, Text, Element, HTMLElement> = new Host()

export const vHost = new VHost<Node, Comment, Text, Element, HTMLElement>(host)

export const h = vHost.createElement
