@echo off
cd /d "E:\Coding\CriticMatch\YeniProje\critic-match"

echo === CriticMatch Git Setup ===
echo.

REM Check if git repo exists
git status >nul 2>&1
if errorlevel 1 (
    echo Initializing git repository...
    git init
    echo.
)

REM Configure git if needed
git config user.email >nul 2>&1
if errorlevel 1 (
    git config user.name "CriticMatch Dev"
    git config user.email "dev@criticmatch.local"
)

REM Stage all files
echo Staging all files...
git add -A
echo.

REM Check if there are any commits already
git log --oneline -1 >nul 2>&1
if errorlevel 1 (
    echo Creating initial commit...
    git commit -m "feat: ITAD integration + ResultsPage bug fixes

- Fix handleSelectCritic: now correctly loads critic.reviews (fixes Not Reviewed bug)
- Fix latestReviews as separate state from criticReviews (tab switching no longer corrupts data)
- Add ITADService integration: parallel deal fetch in runAnalysis
- Add GameRecommendationsSection: two-column panel (ITAD deals + similar games)
- Add ITADDealRow component: poster, store, price with discount badge
- Add SimilarGameCard component: poster card with rank, score, genres
- Fix ResultsPage.jsx corruption: was 22835 lines (12x duplicate), now clean 1882 lines"
) else (
    echo Amending/replacing last commit...
    git commit --amend -m "feat: ITAD integration + ResultsPage bug fixes

- Fix handleSelectCritic: now correctly loads critic.reviews (fixes Not Reviewed bug)
- Fix latestReviews as separate state from criticReviews (tab switching no longer corrupts data)
- Add ITADService integration: parallel deal fetch in runAnalysis
- Add GameRecommendationsSection: two-column panel (ITAD deals + similar games)
- Add ITADDealRow component: poster, store, price with discount badge
- Add SimilarGameCard component: poster card with rank, score, genres
- Clean ResultsPage.jsx: was 22835 lines (12x duplicate), now clean 1882 lines"
)

echo.
echo === Done! ===
git log --oneline -5
echo.
pause
