import React from 'react'
import { Route } from 'react-router-dom'
import Personal from './personal/Personal'
import { CategoryPage, MoodPage } from './discovery'

const routes = [
  <Route exact path="/personal" render={() => <Personal />} key={'personal'} />,
  <Route exact path="/categories" component={CategoryPage} key="categories" />,
  <Route exact path="/moods" component={MoodPage} key="moods" />,
]

export default routes
