/* global $IS_DEVELOPMENT:false */
import { HttpStatus } from '@fuelrats/web-util/http'
import jsCookie from 'js-cookie'
import nextCookies from 'next-cookies'
import Router from 'next/router'

import frApi from '~/services/fuelrats'





const MAX_TITLE_LENGTH = 50
const MAX_DESCR_LENGTH = 300
const validatePageMeta = (props) => {
  if (!props.title?.length) {
    console.error('Pages must contain a unique title')
  }

  if (props.title?.length > MAX_TITLE_LENGTH) {
    console.warn(`Page titles should be fewer than 60 characters, preferably closer to 50. This page's title is ${props.title.length} characters.`)
  }

  if (props.description?.length > MAX_DESCR_LENGTH) {
    console.error(`Page description is too long! The description should be 50-300 characters long, but this page's description is ${props.description.length} characters.`)
  }

  if (props.description && props.description.indexOf('"') !== -1) {
    console.error('Page descriptions shouldn\'t contain double quotes.')
  }
}





export const pageRedirect = (ctx, route) => {
  let href = null
  let as = null

  if (typeof route === 'object') {
    href = route.href
    as = route.as
  } else if (typeof route === 'string') {
    as = route
  }

  if (ctx.res) {
    ctx.res.writeHead(HttpStatus.FOUND, {
      Location: as,
    })
    ctx.res.end()
    ctx.res.finished = true
  } else if (route.startsWith('http')) {
    if (typeof window !== 'undefined') {
      window.location.replace(as)
    }
  } else {
    Router.replace(href ?? as, as)
  }
}





export const deleteCookie = (cookieName, ctx = {}) => {
  if (ctx.res) {
    ctx.res.setHeader('Set-Cookie', `${cookieName}=null; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`)
  } else {
    jsCookie.remove(cookieName)
  }
}





export const setError = (ctx, statusCode, message) => {
  if (ctx.res) {
    ctx.res.statusCode = statusCode
  }
  ctx.err = { statusCode, message }
}





export const resolvePageMeta = async (Component, ctx, pageProps) => {
  const pageMeta = {
    description: 'The Fuel Rats are Elite: Dangerous\'s premier emergency refueling service. Fueling the galaxy, one ship at a time, since 3301.',
    ...(await Component.getPageMeta?.(ctx, pageProps)) ?? {},
  }

  if ($IS_DEVELOPMENT) {
    validatePageMeta(pageMeta)
  }

  return {
    ...pageMeta,
    className: `${(pageMeta.title ?? 'fuel-rats').toLowerCase().replace(/\s/gu, '-')} ${pageMeta.className}`,
  }
}





export const configureRequest = (ctx) => {
  // Always setup access token
  const { access_token: accessToken } = nextCookies(ctx)
  if (accessToken) {
    ctx.accessToken = accessToken
  }

  // If we're on the server, we should set proxy headers to retain origin IP
  if (ctx.isServer) {
    const realIp = ctx.req.headers['x-real-ip'] ?? ctx.req.client?.remoteAddress
    if (realIp) {
      frApi.defaults.headers.common['x-real-ip'] = realIp
    }

    const forwardedFor = ctx.req.headers['x-forwarded-for'] ?? ctx.req.client?.remoteAddress
    if (forwardedFor) {
      frApi.defaults.headers.common['x-forwarded-for'] = forwardedFor
    }

    const forwardedProto = ctx.req.headers['x-forwarded-proto'] ?? ctx.req.headers.host
    if (forwardedProto) {
      frApi.defaults.headers.common['x-forwarded-proto'] = forwardedProto
    }
  }
}
