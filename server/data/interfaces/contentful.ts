/** Asset links within a Contentful GraphQL “Rich Text” field */
export interface ArticleTextLinks {
  assets?: ArticleTextAssets
}

interface ArticleTextAssets {
  block?: Asset[]
  hyperlink?: Asset[]
}

interface Asset {
  __typename: 'Asset'
  sys: { id: string }
  contentType: string
  url: string
  title: string
  description: string
  fileName?: string
  width?: number
  height?: number
}
