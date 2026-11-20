# Payments (HAAD Store)
| Method | State out of the box | What turns it on |
|---|---|---|
| Cash on delivery | Working | nothing; admin marks "cash collected" |
| Meezan bank transfer | Off until real bank details exist | `BANK_ACCOUNT_TITLE` + `BANK_ACCOUNT_NUMBER` or `BANK_IBAN` (+ `BANK_NAME`) |
| JazzCash | Off | `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT`, `JAZZCASH_MODE=sandbox` (then `live`) |
| Easypaisa | Off | `EASYPAISA_STORE_ID`, `EASYPAISA_HASH_KEY`, `EASYPAISA_MODE=sandbox` (then `live`) |

Rules built in: price always from the database; a browser redirect never marks an order paid; JazzCash is marked paid only after a signed callback AND a server-to-server inquiry with JazzCash; Easypaisa and bank transfers always wait in "Pending verification" until an admin verifies; every status change is logged (who/when/note); receipts are stored privately in the database and only an admin can open them.
Not verified against the real gateways (no merchant credentials): field names, inquiry URL, response codes. Test in each gateway's sandbox before going live. JazzCash's own page redirection requires the merchant password inside the posted form (their protocol); the integrity salt is never sent to the browser.
