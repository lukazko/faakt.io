---
description: Vytvoří stručné české release notes pro aktuální lokální verzi faakt.io v právě otevřené větvi. Použij při požadavku na novinky a opravy oproti předchozí verzi.
---

# Release notes pro faakt.io

1. Zjisti aktuální větev a stav pracovního stromu pomocí `git status --short --branch`. Aktuální verzi přečti z pracovního `package.json`.
2. Najdi hranici aktuální verze na historii první rodičovské linie (`git log --first-parent -G '"version"' -- package.json`). Hodnoty ověř přímo v historických verzích `package.json`. Jako základ vezmi poslední stav před přechodem na aktuální verzi, obvykle prvního rodiče commitu, který ji zavedl. Tím zahrneš i změny z commitu s navýšením verze. Pokud je navýšení jen v pracovním stromu, použij `HEAD`. Tag použij jako doplňující vodítko. Pokud nelze předchozí verzi spolehlivě určit, uveď použitý výchozí bod a jeho omezení.
3. Projdi `git log <základ>..HEAD`, `git diff --stat <základ>` a relevantní části výsledného diffu. Zohledni staged, unstaged i relevantní nové soubory z `git status`. Popisuj výsledné chování aplikace a vynech změny, které byly mezitím vráceny. Nové příspěvky nebo ilustrace shrň společně a počet uveď jen po ověření.
4. Vrať krátký Markdown s nadpisem `faakt.io <aktuální verze>` a údajem, oproti které verzi srovnáváš. Použij sekce **Novinky** a **Opravy**, prázdnou sekci vynech. Piš jednou větou na bod z pohledu uživatele. Interní úpravy zmiň jen při viditelném dopadu. Výstup předej v chatu a pracuj pouze se čtením lokálního repozitáře.
