import * as React from 'react'
import { Link } from '@tanstack/react-router'

type NextLinkProps = Omit<React.ComponentProps<typeof Link>, 'to'> & {
  href: string
}

export default function NextLink({ href, ...props }: NextLinkProps) {
  return <Link to={href} {...props} />
}
