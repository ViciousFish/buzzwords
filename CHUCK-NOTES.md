# Auth Issue

- the log message is `rejected socket connection: couldn't find userId from token`
- authToken record was `deleted: true` in the database
- observed (but did not capture with devtools) a case where the sidebar populated successfully _and_ the error happened.
- update on ^that: when I clicked logout in firefox, the page reloaded with an even _older_ user's sidebar, _then_ the error happened. I think maybe the sidebar + error at the same time was a unrelated bug about not deleting cookies and tokens locally on logout or something, and it was just old cookies I had lying around from before we switched to localstorage
- also, socket call happened twice that time in firefox