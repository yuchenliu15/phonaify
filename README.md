# Phonaify
A Chrome extension that helps you perfect your pronunciation and understanding of English!

Uses local Gemini Nano's Prompt API in Chrome to layout standard definitions and phonetics, extract user pronunciations, and give feedback based off of phonetics of user pronunciations.

<img width="647" height="497" alt="image" src="https://github.com/user-attachments/assets/a02a812c-3680-4251-96d0-9c3247ecbf9b" />

---

> [!WARNING]
> ⚠️NOTE⚠️: Since Gemini Nano's Prompt API with Multimodal Input is only experimental in Chrome, go to `chrome://flags` and enable "Prompt API with Multimodal Input" in order to use Phonaify. (May also need page refresh after Chrome re-launch)

> <img width="1013" height="519" alt="image" src="https://github.com/user-attachments/assets/21233354-d7be-41f7-8649-85eb71d2ab96" />


## Implementation details
- Structured output to retrieve definition, synonyms, parts of speech, phonetics, and example sentences of a word
- Structured output for audio and text prompt to Gemini Nano to retrieve user's pronunciations
- LCS (longest common sequence) to compare/diff phonetics between standard vs. user pronunciations

## Todos in future
- Have long memory/context of user pronunciations to track user's pronunciation over time
- Cold start is really slow right now - ~4 seconds. maybe use caching/initialzing the local model in background
- LCS is simple but has drawbacks, i.e. it's character level comparison. We should explore other comparisons for phonetics
- Tune temperature and and topk

## Developing locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open Chrome and navigate to `chrome://extensions/`, enable "Developer mode", and load the unpacked extension from the `dist` directory.

4. Build for production:

```bash
npm run build
```

## Project Structure

- `src/popup/` - Extension popup UI
- `src/content/` - Content scripts
- `manifest.config.ts` - Chrome extension manifest configuration

## Documentation

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)

## Chrome Extension Development Notes

- Use `manifest.config.ts` to configure your extension
- The CRXJS plugin automatically handles manifest generation
- Content scripts should be placed in `src/content/`
- Popup UI should be placed in `src/popup/`
