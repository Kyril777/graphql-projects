const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString, 
	GraphQLList, 
	GraphQLInt,
	GraphQLNonNull
} = require('graphql')
const app = express();

const authors = [
	{ id: 1, name: 'Ernest Hemingway' },
	{ id: 2, name: 'F. Scott Fitzgerald' },
	{ id: 3, name: 'William Faulkner' }
]

const books = [
	{ id: 1, name: 'The Sun Also Rises', authorId: 1 },
	{ id: 2, name: 'A Farewell to Arms', authorId: 1 },
	{ id: 3, name: 'For Whom the Bell Tolls', authorId: 1 },
	{ id: 4, name: 'The Great Gatsby', authorId: 2 },
	{ id: 5, name: 'This Side of Paradise', authorId: 2 },
	{ id: 6, name: 'Tender is the Night', authorId: 2 },
	{ id: 7, name: 'The Sound and the Fury', authorId: 3 },
	{ id: 8, name: 'Absalom, Absalom', authorId: 3 },
	{ id: 9, name: 'Light in August', authorId: 3 }
]

const BookType = new GraphQLObjectType({
	name: 'Book',
	description: 'This represents a book written by an author.',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
		author: {
			type: AuthorType,
			resolve: (book) => {
				return authors.find(author => author.id === book.authorId)
			}
		}
	})
})

const AuthorType = new GraphQLObjectType({
	name: 'Author',
	description: 'This represents an author of a book.',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		books: { 
			type: new GraphQLList(BookType),
			resolve: (author) => {
				return books.filter(book => book.authorId === author.id)
			}
		}
	})
})

const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
		book: {
			type: BookType,
			description: 'A Single Book',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => books.find(book => book.id === args.id)	
		},
		books: {
			type: new GraphQLList(BookType),
			description: 'List of All Books',
			resolve: () => books
		},
		authors: {
			type: new GraphQLList(AuthorType),
			description: 'List of all Authors',
			resolve: () => authors 
		},
		author: {
			type: AuthorType,
			description: 'A Single Author',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => authors.find(author => author.id === args.id) 
		}
	})
})

const RootMutationType = new GraphQLObjectType({
	name: 'Mutation',
	description: 'Root Mutation',
	fields: () => ({
		addBook: {
			type: BookType,
			description: 'Add a Book',
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
				authorId: { type: GraphQLNonNull(GraphQLInt) }
			},
			resolve: (parent, args) => {
				const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
				books.push(book)
				return book;
			}
		},
		addAuthor: {
			type: AuthorType,
			description: 'Add an Author',
			args: {
				name: { type: GraphQLNonNull(GraphQLString) }
			},
			resolve: (parent, args) => {
				const author = { id: authors.length + 1, name: args.name }
				authors.push(author)
				return author;
			}
		}
	})
})

const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  }),
);

app.listen(4000, () => {
    console.log('Server is running on port 4K')
});
