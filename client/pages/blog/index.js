// Module imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'
import React from 'react'




// Component imports
import { PageWrapper } from '../../components/AppLayout'
import TextPlaceholder from '../../components/TextPlaceholder'
import safeParseInt from '../../helpers/safeParseInt'
import { Link } from '../../routes'
import { connect } from '../../store'
import {
  selectBlogs,
  selectBlogAuthors,
  selectBlogCategories,
  selectBlogStatistics,
} from '../../store/selectors'





// Component constants
const BASE_TEN_RADIX = 10
const DEFAULT_PAGE = 1





@connect
class Blogs extends React.Component {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  state = {
    retrieving: false,
  }





  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  _renderMenu () {
    const {
      author,
      category,
      page,
      totalPages,
    } = this.props

    return (
      <menu
        type="toolbar">
        <div className="secondary">
          {(page > 1) && (
            <Link route="blog list" params={{ author, category, page: Math.max(1, page - 1) }}>
              <a className="button">Previous Page</a>
            </Link>
          )}
        </div>

        <div className="primary">
          {(page < totalPages) && (
            <Link route="blog list" params={{ author, category, page: Math.min(page + 1, totalPages) }}>
              <a className="button">Next Page</a>
            </Link>
          )}
        </div>
      </menu>
    )
  }

  async _getBlogs (options = {}) {
    let {
      author,
      category,
    } = this.props

    const {
      page,
      getBlogs,
    } = this.props

    const wpOptions = {}

    author = typeof options.author === 'undefined' ? author : options.author
    category = typeof options.category === 'undefined' ? category : options.category

    if (author) {
      wpOptions.author = author
    }

    if (category) {
      wpOptions.categories = category
    }

    wpOptions.page = options.page || page

    this.setState({
      retrieving: true,
    })

    await getBlogs(wpOptions)

    this.setState({
      retrieving: false,
    })
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  componentDidMount () {
    this._getBlogs()
  }


  static getInitialProps ({ query }) {
    const props = {}

    props.page = safeParseInt(query.page || DEFAULT_PAGE, BASE_TEN_RADIX, DEFAULT_PAGE)

    if (query.category) {
      props.category = query.category
    }

    if (query.author) {
      props.author = query.author
    }

    return props
  }

  render () {
    const { authors, blogs, categories } = this.props
    const {
      retrieving,
    } = this.state

    return (
      <PageWrapper title="Blog">
        <div className="page-content">
          <ol className="article-list loading">
            {!retrieving && Boolean(blogs.length) && blogs.map((blog) => {
              const {
                id,
              } = blog
              const postedAt = moment(blog.date_gmt)
              const author = authors[blog.author] || {
                id: blog.author,
                name: (<TextPlaceholder size={30} loading />),
              }

              /* eslint-disable react/no-danger */
              return (
                <li key={id}>
                  <article>
                    <header>
                      <h3 className="title">
                        <Link route="blog view" params={{ blogId: id }}>
                          <a dangerouslySetInnerHTML={{ __html: blog.title.rendered }} />
                        </Link>
                      </h3>
                    </header>

                    <small>
                      <span className="posted-date">
                        <FontAwesomeIcon icon="clock" fixedWidth />
                        Posted <time dateTime={0}>{postedAt.format('DD MMMM, YYYY')}</time>
                      </span>

                      <span className="author">
                        <FontAwesomeIcon icon="user" fixedWidth />
                        <Link route="blog list" params={{ author: author.id }}>
                          <a>{author.name}</a>
                        </Link>
                      </span>

                      <span>
                        <FontAwesomeIcon icon="folder" fixedWidth />

                        <ul className="category-list">
                          {blog.categories.map((catId) => {
                            const category = categories[catId] || {
                              id: catId,
                              description: 'Loading...',
                              name: (<TextPlaceholder size={25} loading />),
                            }

                            const {
                              description,
                              name,
                            } = category

                            return (
                              <li key={category.id}>
                                <Link route="blog list" params={{ category: category.id }}>
                                  <a title={description}>{name}</a>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </span>
                    </small>

                    <div
                      className="article-content"
                      dangerouslySetInnerHTML={{ __html: blog.excerpt.rendered }} />
                  </article>
                </li>
              )
              /* eslint-enable */
            })}
          </ol>

          {this._renderMenu()}
        </div>
      </PageWrapper>
    )
  }

  static mapStateToProps = (state) => ({
    blogs: selectBlogs(state),
    authors: selectBlogAuthors(state),
    categories: selectBlogCategories(state),
    ...selectBlogStatistics(state),
  })

  static mapDispatchToProps = ['getBlogs']
}





export default Blogs
