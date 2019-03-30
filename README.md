# send-webmentions

[![Greenkeeper badge](https://badges.greenkeeper.io/qubyte/send-webmentions.svg)](https://greenkeeper.io/)

This server exposes a webhook notification. When called, it will scan the configured site for new links to third-party sites, check if those sites are receptive to webmentions, and for ones that are dispatches mentions to them. Mentions which have been sent are kept in a local database so that mentions aren't sent more than once.

To use this yourself, remix this glitch and update these fields in package.json:

 - `baseUrl`: The base URL of your blog, including the protocol and domain (and not a path).
 - `denyList`: A list of regular expressions for URLs to ignore. URLs which begin with `baseUrl` or are relative will be automatically ignored.
 - `postPattern`: A regular expression to match URLs of your site which are blog entries.

Links in webmentions should be omitted. Add a class to each anchor tag in a webmention of `webmention` to filter them out.

This glitch assumes that you have a `/sitemap.txt`, and it uses this to determine a list of blog entries to process.

This glitch also assumes that your posts have a `<time>` element with a class including `dt-published` in it, and that posts with updates have a second `<time>` element with a class including `dt-updated`. It uses these to go through the following process for each new blog post:

 - A request is made for the post. The ETag is taken from the headers, and the `dt-published` and `dt-updated` are extracted from the both. If the latter is not found it defaults to the same value as `dt-published`. These are stored.
 - URLs are extracted and filtered according to the `denyList` and the `baseUrl`.
 - This glitch attempts to dispatch a mention for each remaining URL. When an endpoint was found for a URL and the dispatch successful, this glitch stores a record of the mention so that it doesn't get resent in the future.

For an existing blog post:

 - A request is made for the post. The ETag is taken from the headers. If this ETag matches the one stored, then no further processing occurs.
 - The body is processed for a `<time>` element with `dt-updated`. If the element is not found or the value of it has not changed, then no futher processing occurs and the ETag stored by this glitch for the post is updated.
 - URLs are extracted and filtered according to the `denyList` and the `baseUrl`. Any URLs matching existing mentions for this post are also filtered out.
 - This glitch attempts to dispatch a mention for each remaining URL, storing successful mentions to avoid dispatching them again in the future. The ETag and update time stored for the post are updated.