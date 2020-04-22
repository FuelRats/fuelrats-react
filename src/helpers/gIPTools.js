/* global $IS_DEVELOPMENT:false */
import nextCookies from 'next-cookies'





import { Router } from '../routes'
import frApi from '../services/fuelrats'
import HttpStatus from './HttpStatus'





const MAX_TITLE_LENGTH = 50
const MAX_DESCR_LENGTH = 300
const validatePageMeta = (props) => {
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
  if (ctx.res) {
    ctx.res.writeHead(HttpStatus.FOUND, {
      Location: route,
    })
    ctx.res.end()
    ctx.res.finished = true
  } else {
    Router.replace(route)
  }
}





export const setError = (ctx, statusCode) => {
  if (ctx.res) {
    ctx.res.statusCode = statusCode
  }
  ctx.err = { statusCode }
}





export const resolvePageMeta = async (Component, ctx, pageProps) => {
  const pageMeta = (await Component.getPageMeta?.(ctx, pageProps)) ?? {}

  if ($IS_DEVELOPMENT) {
    validatePageMeta(pageMeta)
  }

  return {
    title: 'Fuel Rats',
    description: 'The Fuel Rats are Elite: Dangerous\'s premier emergency refueling service. Fueling the galaxy, one ship at a time, since 3301.',
    ...pageMeta,
  }
}


export const configureRequest = (ctx) => {
  // Always setup access token
  const { access_token: accessToken } = nextCookies(ctx)
  ctx.accessToken = accessToken
  frApi.defaults.headers.common.Authorization = `Bearer ${accessToken}`

  console.log(ctx.req.headers)

  // If we're on the server, we should set proxy headers to retain origin IP
  if (ctx.isServer) {
    frApi.defaults.headers.common['x-real-ip'] = ctx.req.headers['x-real-ip'] ?? ctx.req.client.remoteAddress
    frApi.defaults.headers.common['x-forwarded-for'] = ctx.req.headers['x-forwarded-for'] ?? ctx.req.client.remoteAddress
    frApi.defaults.headers.common['x-forwarded-proto'] = ctx.req.headers['x-forwarded-proto'] ?? ctx.req.headers.host
  }
}
