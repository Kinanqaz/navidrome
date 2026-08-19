import React, { Suspense } from 'react'
import { Loading } from 'react-admin'

export const lazyLoad = (importFunc) => {
  const LazyComponent = React.lazy(importFunc)
  const WrappedComponent = (props) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  )
  WrappedComponent.displayName = 'LazyLoadedComponent'
  return WrappedComponent
}

export default lazyLoad
