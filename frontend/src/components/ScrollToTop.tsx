import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    // /page#section jaise link par us section tak le jao
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    // 'instant' zaroori hai, kyunki CSS me scroll-behavior: smooth hai,
    // warna page khulte hi upar tak scroll hota hua dikhega
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}