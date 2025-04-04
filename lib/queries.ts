import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY = defineQuery(`
    *[_type == "startup"] | order(_createAt desc) {
    _id,
    title,
    slug,
    _createdAt,
    author -> {
        _id, name, image, bio
    },
    views,
    description,
    category,
    image
}`)