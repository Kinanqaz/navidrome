import React from 'react'
import { Route } from 'react-router-dom'
import { lazyLoad } from './common'

const Personal = lazyLoad(() => import('./personal/Personal'))
const GenrePage = lazyLoad(() =>
  import('./discovery').then((m) => ({ default: m.GenrePage })),
)
const CategoryPage = lazyLoad(() =>
  import('./discovery').then((m) => ({ default: m.CategoryPage })),
)
const MoodPage = lazyLoad(() =>
  import('./discovery').then((m) => ({ default: m.MoodPage })),
)

const routes = [
  <Route exact path="/personal" component={Personal} key={'personal'} />,
  <Route exact path="/genres" component={GenrePage} key="genres" />,
  <Route exact path="/categories" component={CategoryPage} key="categories" />,
  <Route exact path="/moods" component={MoodPage} key="moods" />,
]

export default routes
