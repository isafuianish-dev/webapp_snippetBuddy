# Snippet Buddy

Your personal, private library for code snippets — organized into books, tagged, searchable, and always at your fingertips.

Snippet Buddy is a lightweight tool for saving the bits of code you keep re-using or re-Googling: shell one-liners, SQL queries, regex patterns, boilerplate functions, config blocks — anything you'd rather copy-paste than retype. Instead of scattering these across sticky notes, chat history, or random text files, you keep them here, organized by project or topic, labeled by language, and ready to copy in one click.

## Features

- **Snippet Books** — Group your snippets into named collections (e.g. "Work Scripts", "SQL", "Python"). Books keep unrelated snippets from cluttering each other, and each one shows a live count of how many snippets it holds.
- **All Snippets view** — A combined view across every book, so you can search or browse everything at once without picking a book first.
- **Rich snippet details** — Every snippet can have a title, a language label, the actual code, free-form notes (e.g. "sanitize input before running this"), and comma-separated tags for extra categorization.
- **Language badges & color coding** — Each snippet's language is shown as a small colored badge on its card. The color is generated automatically from the language name, so the same language always gets the same color, making it easy to spot at a glance.
- **Language filter** — A dropdown above your snippets lets you filter the current book (or All Snippets) down to just one language.
- **Full-text search** — Two independent search boxes: one to search your list of books by name, and one to search snippets by title, code, notes, language, and tags — all at once.
- **Pinning** — Star your most-used snippets to keep them pinned at the top of the grid, in their own "Pinned" section, separate from everything else.
- **Archiving** — Snippets you don't need day-to-day but don't want to delete can be archived. Archived snippets disappear from your normal view and live in a separate Archive view (toggle it with the archive button in the toolbar), and can be restored at any time.
- **One-click copy** — Every snippet card and the detail view have a dedicated copy button that copies just the code to your clipboard — no need to open the snippet and manually select the text. The button briefly turns into a checkmark to confirm the copy worked.
- **Snippet detail view** — Click any snippet card to open a full-size view of its code, notes, tags, and metadata (which book it's in, when it was created, when it was last updated), with quick actions to copy, pin/unpin, archive/restore, edit, or delete right from there.
- **Card previews** — Each card in the grid shows a preview of the code (fading out if it's long) plus the first couple of lines of notes, so you can often tell what a snippet does without opening it.
- **Export your whole library** — One click bundles all your books and snippets into a single JSON file that downloads to your device — a full backup you control.
- **Import from a file** — Load a previously exported JSON file back in. If you already have snippets saved, you'll be asked whether to **append** the imported data alongside what you have, or **clean up and replace** everything with the imported file. Snippet Buddy is also tolerant of plain arrays of snippets (in case you're importing from an older or hand-built file) and will file them into an "Imported" book automatically.
- **Sample snippets** — New to the app? From the empty-library screen you can load a ready-made set of sample snippets (a mix of shell scripting, SQL, and Python snippets across three sample books) to see how everything works before adding your own.
- **Light & dark theme** — Switch between light and dark mode from Settings; your choice is remembered.
- **Accent colors** — Choose your preferred accent color (Indigo, Blue, Green, Rose, Amber, or Purple) from Settings to personalize the look of buttons, highlights, and the active book indicator.

## How to Use

### Creating your first book
When you open Snippet Buddy for the first time, you'll see a welcome screen since you have no books yet. Click **New Book**, give it a name (e.g. "SQL Queries"), and you're ready to start adding snippets. You can also create additional books at any time using the **New Book** button at the top of the left-hand sidebar.

Don't want to start from scratch? Click the sample-snippets link on the welcome screen to instantly populate your library with three example books (KSH shell scripts, SQL, and Python) so you can explore the app's features with real content.

### Adding a snippet
Click **New Snippet** (top-right of the main panel). Fill in:
- **Title** — a short, memorable name (defaults to "Untitled snippet" if left blank).
- **Book** — which book this snippet belongs to (a dropdown of all your books).
- **Language** — type or pick from suggestions (JavaScript, Python, SQL, Bash, and many more are offered, but you can type any language name you like).
- **Code** — the actual snippet, in a monospace, resizable text box.
- **Notes** — any context, warnings, or reminders about the snippet.
- **Tags** — comma-separated keywords for extra filtering via search (e.g. "regex, cleanup").

Click **Add Snippet** to save it. It immediately appears in the relevant book and in All Snippets.

### Browsing and organizing
- Click a book in the left sidebar to view only its snippets; click **All Snippets** at the top of the list to see everything.
- Use the search box above the book list to quickly find a book by name when you have many.
- Use the search box above the snippet grid to find snippets by anything in their title, code, notes, language, or tags.
- Use the language dropdown next to the search box to narrow the view down to a single language.
- Hover over a book to reveal **Rename** and **Delete** icons. Deleting a book also deletes every snippet inside it, so you'll be asked to confirm first (and told how many snippets will go with it).

### Working with a snippet
Hover over any snippet card to reveal its action buttons:
- **Copy** — copies the snippet's code to your clipboard.
- **Pin / Unpin** — the pin icon in the corner of the card toggles whether it shows up in the "Pinned" section at the top.
- **Archive / Restore** — moves it out of (or back into) your active view.
- **Delete** — removes it permanently, after a confirmation prompt.

Click anywhere on the card body (not the icon buttons) to open the full detail view, where you can read the complete code and notes, copy the code, and access the same pin/archive/edit/delete actions plus an **Edit** button to update any field.

### Viewing the archive
Click the archive icon in the toolbar to switch to your Archive view — a separate list of everything you've archived, with the option to restore any snippet back to active use. Click the icon again to return to your active snippets.

### Backing up and moving your data
- Click the **download icon** next to "New Book" to export your entire library (all books and snippets) as a single JSON file you can save anywhere.
- Click the **upload icon** to import a previously exported file. If your library already has content, you'll be prompted to choose between appending the new data or replacing everything.

## Tips & Shortcuts

- **Everything is saved automatically** — there's no explicit "save" step for your library as a whole. As soon as you add, edit, pin, archive, or delete a snippet, it's saved right away.
- **Your data stays on your device.** Snippet Buddy stores everything directly in your browser — nothing is uploaded to a server or shared anywhere. This also means your snippets are tied to this browser on this device; use Export/Import if you want to move your library to another browser or computer, or just to keep a backup.
- Press **Escape**, or click outside a dialog, to close most popups (add/edit forms, detail view, settings) — except when a choice is required, like confirming an import conflict.
- When creating a snippet while a specific book is open, that book is pre-selected in the form, saving you a step.
- The language field offers common languages as suggestions, but nothing stops you from typing a custom or less common one — the color-coded badge will still work.
- Tags are optional but make search more powerful — a well-tagged snippet library is much easier to search through later.
- Archiving is a great way to keep old or rarely used snippets out of your day-to-day view without losing them for good — nothing is deleted until you explicitly delete it.

## Customization

Click the gear icon in the top-right corner to open **Settings**, where you can:
- Toggle between **Light** and **Dark** theme.
- Pick an **accent color** (Indigo, Blue, Green, Rose, Amber, or Purple) to change the highlight color used throughout the app.

Both preferences are remembered automatically for the next time you open the app.
