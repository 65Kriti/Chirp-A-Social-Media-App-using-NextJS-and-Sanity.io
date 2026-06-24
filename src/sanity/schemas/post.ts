export const postSchema = {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'text',
      title: 'Text',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'user' }],
    },
    {
      name: 'likes',
      title: 'Likes',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'user' }] }],
    },
    {
      name: 'comments',
      title: 'Comments',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'comment',
          title: 'Comment',
          fields: [
            {
              name: 'author',
              title: 'Author',
              type: 'reference',
              to: [{ type: 'user' }],
            },
            {
              name: 'text',
              title: 'Text',
              type: 'string',
            },
            {
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime',
            },
          ],
        },
      ],
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    },
  ],
};
