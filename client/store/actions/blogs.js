// Component imports
import httpStatus from '../../helpers/httpStatus'
import wpApi from '../../services/wordpress'
import actionTypes from '../actionTypes'
import initialState from '../initialState'
import { wpApiRequest, createAxiosAction } from './services'





export const getAuthor = (authorId) => wpApiRequest(
  actionTypes.wordpress.authors.read,
  { url: `/users/${authorId}` },
)





export const getCategory = (categoryId) => wpApiRequest(
  actionTypes.wordpress.categories.read,
  { url: `/categories/${categoryId}` },
)





export const getBlog = (id) => async (dispatch, getState) => {
  const response = await wpApi.request({
    url: `/posts/${id}`,
  })

  if (httpStatus.isSuccess(response.status)) {
    const {
      author: authorId,
      categories: categoryIds,
    } = response.data

    const state = getState ? getState() : { ...initialState }
    const { authors, categories } = state.blogs

    if (!authors[authorId]) {
      await getAuthor(authorId)(dispatch)
    }

    await Promise.all(categoryIds.map((categoryId) => {
      if (!categories[categoryId]) {
        return getCategory(categoryId)(dispatch)
      }
      return Promise.resolve()
    }))
  }

  return dispatch(createAxiosAction(actionTypes.wordpress.posts.read, response))
}





export const getBlogs = (params) => async (dispatch, getState) => {
  const response = await wpApi.request({
    url: '/posts',
    params,
  })

  if (httpStatus.isSuccess(response.status)) {
    const state = getState ? getState() : { ...initialState }
    const authorCache = { ...state.blogs.authors }
    const categoryCache = { ...state.blogs.categories }

    Object.values(response.data).forEach(({ author: authorId, categories: categoryIds }) => {
      if (!authorCache[authorId]) {
        authorCache[authorId] = {}
        getAuthor(authorId)(dispatch)
      }

      categoryIds.forEach((categoryId) => {
        if (!categoryCache[categoryId]) {
          categoryCache[categoryId] = {}
          getCategory(categoryId)(dispatch)
        }
      })
    })
  }

  return dispatch(createAxiosAction(actionTypes.wordpress.posts.search, response))
}
