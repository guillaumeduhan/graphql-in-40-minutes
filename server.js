const express = require('express');
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');
const app = express();

const authors = [
  {
    id: 1,
    name: 'Dostoievski'
  },
  {
    id: 2,
    name: 'LF Céline'
  },
  {
    id: 3,
    name: 'Jack Kerouac'
  }
]

const books = [
  {
    authorId: 1,
    id: 1,
    name: 'L\'Idiot'
  },
  {
    authorId: 1,
    id: 2,
    name: 'Crimes et châtiments'
  },
  {
    authorId: 2,
    id: 3,
    name: 'Voyage au bout de la Nuit'
  },
  {
    authorId: 3,
    id: 4,
    name: 'Sur la route'
  }
]

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id)
      }
    }
  })
})

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    authorId: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    author: {
      type: new GraphQLList(AuthorType),
      resolve: (book) => {
        return authors.find(author => author.id === book.authorId)
      }
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addAuthor: {
      type: AuthorType,
      description: 'add an author',
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString)
        },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name
        }
        authors.push(author)
        return author
      }
    },
    addBook: {
      type: BookType,
      description: 'add a book',
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString)
        },
        authorId: {
          type: GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId
        }
        books.push(book)
        return book
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Ma description',
  fields: () => ({
    author: {
      type: AuthorType,
      description: 'Single author',
      args: {
        id: {
          type: GraphQLInt
        }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of authors',
      resolve: () => authors
    },
    book: {
      type: BookType,
      description: 'Single book',
      args: {
        id: {
          type: GraphQLInt
        }
      },
      resolve: (parent, args) => books.find(book => book.id === args.id)
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of books',
      resolve: () => books
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

app.listen(4000, () => console.log('Server running'));