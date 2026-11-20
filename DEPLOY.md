# HAAD Store ko live karne ki guide

Yeh guide client ke saath baith kar karni hai. Sab kuch free plan se shuru ho sakta hai. Poora kaam 45-60 minute ka hai.
Accounts client ke apne naam par banao, taake site aur data hamesha uska rahe.

## Aap ko kya chahiye
- GitHub account (code rakhne ke liye)
- Vercel account (website chalane ke liye): vercel.com
- Turso account (database): turso.tech
- Domain (optional, baad mein bhi lag sakta hai)
- Resend account (order email ke liye, optional): resend.com

## Step 1: Database banao (Turso)
1. turso.tech par sign up karo, phir "Create database" karo, naam `haad`.
2. Database ke page par **Database URL** copy karo (`libsql://haad-....turso.io`).
3. "Create token" karo aur **token** copy karo.

## Step 2: Tables aur admin account banao
Apne computer par project folder mein `.env` file kholo aur yeh 4 lines **abhi ke liye** badlo:

```
DATABASE_URL="libsql://haad-....turso.io"
DATABASE_AUTH_TOKEN="(Turso wala token)"
ADMIN_EMAIL="client ki email"
ADMIN_PASSWORD="mazboot password, kam az kam 10 characters"
```

Phir terminal mein:

```
npm install
npm run db:setup
```

Yeh Turso mein tables banata hai, sample perfumes daalta hai aur admin account banata hai.
Sample perfumes baad mein admin se hide kar do, jab asli wale add ho jayen.
Khali `.env` file apne computer par sambhal kar rakho, GitHub par kabhi upload mat karna (`.gitignore` ne pehle se roka hua hai).

## Step 3: Code GitHub par daalo
GitHub par nayi private repository banao aur project upload karo (`node_modules`, `.env`, `local.db` upload nahi honge).

## Step 4: Vercel par chalao
1. vercel.com par "Add New > Project" karo aur GitHub wali repository chuno.
2. **Environment Variables** mein yeh daalo:

| Naam | Value |
|---|---|
| `DATABASE_URL` | Turso URL |
| `DATABASE_AUTH_TOKEN` | Turso token |
| `AUTH_SECRET` | lamba random text (neeche tareeqa) |
| `NEXT_PUBLIC_SITE_URL` | `https://haad-store.vercel.app` (ya apni domain) |
| `NEXT_PUBLIC_WHATSAPP` | client ka number, jaise `923001234567` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | client ki email |
| `NEXT_PUBLIC_INSTAGRAM` / `NEXT_PUBLIC_FACEBOOK` | page ke links (optional) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_NOTIFY_EMAIL` | order email ke liye (optional) |

`AUTH_SECRET` banane ka tareeqa: terminal mein
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

`ADMIN_EMAIL` aur `ADMIN_PASSWORD` Vercel mein daalne ki zaroorat nahi, woh sirf Step 2 mein chahiye the.

3. Abhi **Deploy** dabao. Pehli baar photos upload nahi hongi, wo Step 5 mein theek hoga.

## Step 5: Photos ki permanent jagah (Vercel Blob)
1. Vercel mein apne project mein **Storage > Create > Blob** karo aur project se connect karo.
2. Vercel khud `BLOB_READ_WRITE_TOKEN` daal deta hai.
3. **Deployments** mein jaa kar "Redeploy" karo.

Iske baad admin se upload hui photos hamesha rahengi.

## Step 6: Test karo (zaroor)
- Home, shop aur ek product page kholo.
- `/login` se admin login karo, ek asli perfume photo ke saath add karo.
- Ek test order do (COD), phir `/admin` mein dekho ke aa gaya.
- Phone par bhi dekho, aur light/dark button bhi.
- Test order admin mein "cancelled" kar do. Stock wapas khud nahi barhta, wo product edit karke theek karna hoga.

## Step 7: Domain lagao
Vercel project > **Settings > Domains** mein client ki domain daalo, aur jo DNS records Vercel dikhaye wo domain wale ke panel mein laga do.
Phir `NEXT_PUBLIC_SITE_URL` ko asli domain par badlo aur Redeploy karo, taake Google aur link previews sahi chalen.

## Live karne se pehle client se yeh cheezein lo
- Asli perfumes: naam, qeemat, notes, 5 angle ki photos
- Delivery, Returns aur Privacy pages ka asli text (abhi draft hai, `src/app/delivery`, `returns`, `privacy`)
- WhatsApp number, email, social links
- Asli logo files
- Sample perfumes hide karo

## Aham baatein
- Admin password kisi ko mat batao aur kabhi `change-me-123` mat rakho.
- Stock sirf order par kam hota hai. Cancel order par stock admin ko khud theek karna hoga.
- Login par abhi koi "bohot koshishon par rok" nahi hai. Agar site mashhoor ho jaye to yeh add karna chahiye.
