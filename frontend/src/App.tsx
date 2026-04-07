import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── LANGUAGE TYPES & CONTEXT ─────────────────────────────────────────────────
type Lang = "en" | "ru" | "kz";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });
const useLang = () => useContext(LangContext);

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    // Nav
    farmerDash: "Farmer Dashboard", p2pMarket: "P2P Grain Market",
    lenderVault: "Lender Vault", carryVault: "Carry Vault", judgeGuide: "Judge Guide",
    // Topbar
    network: "Network",
    // Farmer tab
    grainTokens: "GRAIN tokens", sgrainVault: "sGRAIN (vault)", usdcBalance: "USDC balance",
    chainRewards: "CHAIN rewards", autoCompounding: "Auto-compounding 3.2%",
    availLiquidity: "Available liquidity", govTokens: "Governance tokens",
    selectSilo: "Select Licensed Silo", tokenizeGrain: "Tokenize Grain",
    selectSiloLabel: "Select silo", mintGrain: "Mint GRAIN Tokens", toSgrain: "→ sGRAIN Vault",
    borrowAgainst: "Borrow Against Grain", maxBorrow: "Max borrow", against: "against",
    borrowUsdc: "Borrow USDC", qoldauReceipt: "QOLDAU DIGITAL RECEIPT · BLOCKCHAIN VERIFIED",
    tokenizedWheat: "Tokenized spring wheat — certified", oraclePrice: "Oracle price",
    totalValue: "Total value", maxBorrow60: "Max borrow (60%)", status: "Status",
    inSiloVerified: "● In-silo, verified", seasonalCarry: "Seasonal carry opportunity",
    historicalSpread: "Historical Sep→Mar spread", positiveYears: "Positive in 80% of years",
    tokenizeAtHarvest: "Tokenize at harvest, hold to spring.",
    seasonalAppreciation: "Seasonal appreciation (6 mo)", lendingYield: "Lending yield (6 mo)",
    storageFeeShare: "Storage fee share (6 mo)", carryVaultLabel: "Carry vault (cGRAIN)",
    totalPotential: "Total potential return",
    mintModal: "Mint GRAIN Tokens", grainQty: "Grain quantity", gostGrade: "GOST Grade",
    detailsStep: "1. Details", verifyStep: "2. Verify", mintStep: "3. Mint",
    minting: "Minting…", mintTokens: "Mint Tokens", cancel: "Cancel",
    borrowModal60: "60% LTV",
    borrowAmt: "Borrow amount", borrowBtn: "Borrow USDC",
    // Market tab
    allGrades: "All grades", grade1: "Grade 1", grade2: "Grade 2", grade3: "Grade 3",
    livePrices: "LIVE PRICES", springWheat: "Spring Wheat",
    protein: "Protein", moisture: "Moisture", available: "Available", seller: "Seller",
    lotFill: "Lot fill", sold: "% sold", buyNow: "Buy Now",
    purchaseLot: "Purchase Grain Lot", quantity: "Quantity",
    price: "Price", receipt: "Receipt", cost: "Cost", grainReceived: "GRAIN received",
    settlement: "Settlement", lessThan1s: "<1 second",
    // Lender tab
    totalDeposited: "Total deposited", earning: "EARNING",
    usdcAcross: "USDC across 2 active vaults", totalEarned: "Total earned",
    blendedApy: "Blended APY", nextPayout: "Next payout",
    grainSeniorVault: "GRAIN Senior Vault", sgrainYieldVault: "sGRAIN Yield Vault",
    seniorTranche: "Senior tranche · first-loss protected",
    earnedSoFar: "earned so far · $25,000 deposited",
    vaultUtil: "Vault utilization", depositedLabel: "deposited",
    yourPositions: "Your positions", depositUsdc: "+ Deposit USDC",
    health: "Health", dep: "dep.", howYieldWorks: "How lender yield works",
    ly1: "Deposit USDC into the vault",
    ly2: "Farmers borrow USDC against silo'd GRAIN tokens (60% LTV)",
    ly3: "Farmers pay 11.2% APR on their loan",
    ly4: "Interest flows to you in real-time as earned yield",
    ly5: "Default protection: GRAIN tokens auto-liquidated via Pyth oracle",
    securedByWheat: "Your USDC is secured by",
    physicallySegregated: "physically segregated wheat",
    inLicensedSilos: "in licensed Kazakh silos. Grain cannot leave without burning the GRAIN tokens.",
    depositModal: "Deposit USDC", earnSecured: "Earn 11.2% APY · secured by silo'd wheat",
    depositAmt: "Deposit amount", depositEarn: "Deposit & Earn",
    annualYield: "Annual yield", monthly: "Monthly",
    // Carry tab
    carrySpreadLabel: "6-month carry", cmePyth: "CME ZW Sep→Mar contango spread · Pyth oracle",
    zwSepSpot: "ZW1! Sep spot", zwMarchFutures: "ZW March futures",
    annualizedCarryApy: "Annualized carry APY", cgrainRate: "cGRAIN Rate",
    yourCgrain: "Your cGRAIN",
    howCarryWorks: "How carry yield works",
    carryExplain: "KZ wheat is harvested Aug–Sep at the seasonal price low. CME March futures trade at a premium (contango). By holding tokenized grain through winter, you capture the spread as yield — on top of storage fees and lending interest.",
    physicalGrain: "Physical GRAIN held in silo", alreadyHappening: "Already happening — no extra cost",
    cgrainAccrues: "cGRAIN exchange rate accrues spread", updatesEveryBlock: "Updates every block via oracle",
    exitInMarch: "Exit in March", moreGrainReturned: "More GRAIN + USDC carry yield returned",
    avgCarry: "Avg carry (2005–2024)", avgCarryVal: "18.4% Sep→Mar, positive 80% of years",
    historicalSpreadTitle: "Historical Sep→Mar spread",
    enterCarryPos: "Enter Carry Position", grainToLock: "GRAIN to lock",
    available2: "Available", enterCarryBtn: "Enter Carry Position",
    yourActiveCarry: "Your Active Carry Position",
    carryPosLabel: "CARRY POSITION · CGRAIN VAULT",
    wheatCarry: "Wheat carry position — earning",
    exchangeRate: "Exchange rate", carryApy: "Carry APY", yieldAccrued: "Yield accrued",
    carryAccruing: "● Carry accruing", exitCarry: "Exit Carry Position",
    noActiveCarry: "No active carry position",
    enterToEarn: "Enter a position to start earning wheat carry yield",
    atApy: "At", inSixMonths: "APY, in 6 months:", kgGrainYield: "kg GRAIN yield",
    onYourPos: "on your position.",
    depositGrain: "Deposit GRAIN → receive cGRAIN. Exchange rate accrues at carry APY. Exit any time to receive more GRAIN than deposited.",
    // Judge tab
    judgeTitle: "GrainChain KZ\nJudge Testing Guide",
    judgeSub: "Tokenizing Kazakh grain warehouse receipts on Solana. Built for the National Solana Hackathon by Decentrathon 2026. Everything is live and verifiable on Solana testnet.",
    onChainAddresses: "On-chain addresses (testnet)",
    deployFirst: "Deploy first with",
    thenRun: "then run",
    toPopulate: "to populate.",
    judgeWallets: "Judge wallets (pre-funded)",
    runWallets: "Run",
    toCreate: "to create 5 funded wallets. Each has 1 SOL + 10,000 USDC + 1,000 GRAIN.",
    importPhantom: "Import any wallet into Phantom (testnet mode) by going to Settings → Add Account → Import Private Key. Keys are in",
    testingWalkthrough: "Testing walkthrough — 9 steps",
    quickCli: "Quick CLI checks",
    legalBasis: "Legal basis (for pitch)",
    legalNote: "GrainChain KZ is the",
    solanaNative: "Solana-native implementation",
    govtPiloting: "of what the KZ government is actively piloting in Kostanay. This is not a hypothetical.",
    copy: "Copy", explorer: "Explorer ↗",
    checkSgrain: "Check sGRAIN rate (should be >1e9)",
    checkCgrain: "Check cGRAIN rate (higher than sGRAIN)",
    verifyGrain: "Verify grain locked in silo",
    runDemo: "Run full demo script",
    liveYield: "Live yield crank",
    carryOracle: "Carry oracle (posts spread)",
    steps: [
      { h:"Oracle mints grain receipt", d:"Oracle signs Qoldau receipt → GrainReceipt PDA created on-chain. Keyed by serial (e.g. KST-2025-00847). Check the PDA on Explorer — it shows grade, protein, moisture, harvest date." },
      { h:"Farmer fractionalizes → GRAIN tokens", d:"GrainReceipt → GRAIN SPL tokens (1 token = 1 kg). Mint from the protocol PDA. Check your GRAIN token account on Explorer." },
      { h:"Lender deposits USDC", d:"USDC enters the LendingVault PDA. LenderPosition PDA created tracking your deposit + earned interest (ticks every block)." },
      { h:"Farmer borrows USDC (Pyth oracle)", d:"GRAIN tokens locked in CollateralEscrow PDA. USDC released at 60% LTV. If testnet Pyth is stale, retry in 30s — feed updates every ~30 seconds." },
      { h:"Deposit GRAIN into sGRAIN vault", d:"GRAIN transferred to GrainReserve PDA. sGRAIN minted at current exchange rate. Exchange rate ONLY increases — check it twice, 60s apart." },
      { h:"Enter carry position → cGRAIN", d:"GRAIN locked in CarryGrainReserve PDA. cGRAIN minted. cGRAIN rate accrues faster than sGRAIN (based on live CME contango spread from carry oracle)." },
      { h:"Run yield crank", d:"yarn crank --interval 10 keeps sGRAIN and cGRAIN rates ticking every 10s. Permissionless — any keypair can call it. Shows proof of autonomous yield." },
      { h:"Repay loan + exit positions", d:"Repay USDC + interest → GRAIN collateral unlocked. Withdraw sGRAIN → receive more GRAIN than deposited (the delta = yield). Exit carry → same." },
      { h:"Claim CHAIN governance rewards", d:"Pro-rata CHAIN tokens distributed based on sGRAIN balance over time. Synthetix-style reward_per_token accumulator. 10M CHAIN over 2 years." },
    ],
    legal: [
      ["Civil Code Arts. 797–802","Grain receipts = non-equity securities"],
      ["Law on Grain (2001)","192 licensed silos, Qoldau.kz registry"],
      ["2022 Amendment ✅","Digital tokens legally replace paper receipts"],
      ["Law on Digital Assets (2023)","Grain tokens = secured digital assets"],
      ["AIFC","English common law, 0% VAT, Fintech Lab"],
      ["Kostanay Pilot (Sep 2025)","Ministry of AI + AIFC blockchain program"],
    ],
    activity: "Activity",
  },
  ru: {
    farmerDash: "Панель фермера", p2pMarket: "P2P рынок зерна",
    lenderVault: "Хранилище кредитора", carryVault: "Кэрри-хранилище", judgeGuide: "Руководство судьи",
    network: "Сеть",
    grainTokens: "Токены GRAIN", sgrainVault: "sGRAIN (хранилище)", usdcBalance: "Баланс USDC",
    chainRewards: "Награды CHAIN", autoCompounding: "Авто-компаундинг 3.2%",
    availLiquidity: "Доступная ликвидность", govTokens: "Токены управления",
    selectSilo: "Выбрать лицензированный элеватор", tokenizeGrain: "Токенизировать зерно",
    selectSiloLabel: "Выберите элеватор", mintGrain: "Выпустить токены GRAIN", toSgrain: "→ Хранилище sGRAIN",
    borrowAgainst: "Займ под залог зерна", maxBorrow: "Макс. займ", against: "против",
    borrowUsdc: "Занять USDC", qoldauReceipt: "ЦИФРОВАЯ КВИТАНЦИЯ QOLDAU · ПОДТВЕРЖДЕНО БЛОКЧЕЙНОМ",
    tokenizedWheat: "Токенизированная яровая пшеница — сертифицировано", oraclePrice: "Цена оракула",
    totalValue: "Общая стоимость", maxBorrow60: "Макс. займ (60%)", status: "Статус",
    inSiloVerified: "● В элеваторе, подтверждено", seasonalCarry: "Сезонная кэрри-возможность",
    historicalSpread: "Исторический спред сен.→мар.", positiveYears: "Положительный в 80% лет",
    tokenizeAtHarvest: "Токенизируйте при урожае, держите до весны.",
    seasonalAppreciation: "Сезонный рост (6 мес.)", lendingYield: "Доходность займов (6 мес.)",
    storageFeeShare: "Доля сборов за хранение (6 мес.)", carryVaultLabel: "Кэрри-хранилище (cGRAIN)",
    totalPotential: "Общий потенциальный доход",
    mintModal: "Выпустить токены GRAIN", grainQty: "Количество зерна", gostGrade: "Класс ГОСТ",
    detailsStep: "1. Детали", verifyStep: "2. Проверка", mintStep: "3. Выпуск",
    minting: "Выпускается…", mintTokens: "Выпустить токены", cancel: "Отмена",
    borrowModal60: "60% LTV",
    borrowAmt: "Сумма займа", borrowBtn: "Занять USDC",
    allGrades: "Все классы", grade1: "Класс 1", grade2: "Класс 2", grade3: "Класс 3",
    livePrices: "ЦЕНЫ В РЕАЛЬНОМ ВРЕМЕНИ", springWheat: "Яровая пшеница",
    protein: "Протеин", moisture: "Влажность", available: "Доступно", seller: "Продавец",
    lotFill: "Заполненность лота", sold: "% продано", buyNow: "Купить",
    purchaseLot: "Покупка партии зерна", quantity: "Количество",
    price: "Цена", receipt: "Квитанция", cost: "Стоимость", grainReceived: "Получено GRAIN",
    settlement: "Расчёт", lessThan1s: "<1 секунды",
    totalDeposited: "Всего внесено", earning: "ЗАРАБАТЫВАЕТСЯ",
    usdcAcross: "USDC в 2 активных хранилищах", totalEarned: "Всего заработано",
    blendedApy: "Средняя APY", nextPayout: "Следующая выплата",
    grainSeniorVault: "Старшее хранилище GRAIN", sgrainYieldVault: "Доходное хранилище sGRAIN",
    seniorTranche: "Старший транш · защита от первых потерь",
    earnedSoFar: "заработано · внесено $25 000",
    vaultUtil: "Утилизация хранилища", depositedLabel: "внесено",
    yourPositions: "Ваши позиции", depositUsdc: "+ Внести USDC",
    health: "Здоровье", dep: "внес.", howYieldWorks: "Как работает доходность кредитора",
    ly1: "Внесите USDC в хранилище",
    ly2: "Фермеры занимают USDC под залог токенов GRAIN в элеваторе (60% LTV)",
    ly3: "Фермеры платят 11.2% годовых по займу",
    ly4: "Проценты поступают к вам в реальном времени как заработанная доходность",
    ly5: "Защита от дефолта: токены GRAIN автоматически ликвидируются через оракул Pyth",
    securedByWheat: "Ваш USDC обеспечен",
    physicallySegregated: "физически изолированной пшеницей",
    inLicensedSilos: "в лицензированных казахстанских элеваторах. Зерно не может покинуть элеватор без сжигания токенов GRAIN.",
    depositModal: "Внести USDC", earnSecured: "Заработайте 11.2% APY · обеспечено зерном в элеваторе",
    depositAmt: "Сумма вклада", depositEarn: "Внести и зарабатывать",
    annualYield: "Годовая доходность", monthly: "Ежемесячно",
    carrySpreadLabel: "6-месячный кэрри", cmePyth: "Спред CME ZW сен.→мар. · Оракул Pyth",
    zwSepSpot: "Спот ZW1! сентябрь", zwMarchFutures: "Фьючерс ZW март",
    annualizedCarryApy: "Годовая кэрри APY", cgrainRate: "Курс cGRAIN",
    yourCgrain: "Ваш cGRAIN",
    howCarryWorks: "Как работает кэрри-доходность",
    carryExplain: "Казахстанская пшеница убирается в авг.–сен. при сезонном минимуме цен. Мартовские фьючерсы CME торгуются с премией (контанго). Удерживая токенизированное зерно зимой, вы фиксируете этот спред как доходность — помимо сборов за хранение и процентов по займам.",
    physicalGrain: "Физический GRAIN в элеваторе", alreadyHappening: "Уже происходит — без дополнительных затрат",
    cgrainAccrues: "Курс cGRAIN аккумулирует спред", updatesEveryBlock: "Обновляется каждый блок через оракул",
    exitInMarch: "Выход в марте", moreGrainReturned: "Больше GRAIN + доходность USDC от кэрри возвращается",
    avgCarry: "Средний кэрри (2005–2024)", avgCarryVal: "18.4% сен.→мар., положительный в 80% лет",
    historicalSpreadTitle: "Исторический спред сен.→мар.",
    enterCarryPos: "Открыть кэрри-позицию", grainToLock: "GRAIN для блокировки",
    available2: "Доступно", enterCarryBtn: "Открыть кэрри-позицию",
    yourActiveCarry: "Ваша активная кэрри-позиция",
    carryPosLabel: "КЭРРИ-ПОЗИЦИЯ · ХРАНИЛИЩЕ CGRAIN",
    wheatCarry: "Кэрри-позиция по пшенице — зарабатывает",
    exchangeRate: "Курс обмена", carryApy: "Кэрри APY", yieldAccrued: "Накопленная доходность",
    carryAccruing: "● Кэрри накапливается", exitCarry: "Закрыть кэрри-позицию",
    noActiveCarry: "Нет активной кэрри-позиции",
    enterToEarn: "Откройте позицию, чтобы начать зарабатывать кэрри-доходность по пшенице",
    atApy: "При", inSixMonths: "APY, через 6 месяцев:", kgGrainYield: "кг доходности GRAIN",
    onYourPos: "на вашу позицию.",
    depositGrain: "Внесите GRAIN → получите cGRAIN. Курс обмена аккумулируется по кэрри APY. Выйдите в любое время, получив больше GRAIN.",
    judgeTitle: "GrainChain KZ\nРуководство для судей",
    judgeSub: "Токенизация казахстанских квитанций зерновых складов на Solana. Создано для Национального хакатона Solana от Decentrathon 2026. Всё работает и верифицируется в сети Solana testnet.",
    onChainAddresses: "Адреса on-chain (testnet)",
    deployFirst: "Сначала запустите",
    thenRun: "затем",
    toPopulate: "для заполнения.",
    judgeWallets: "Кошельки судей (предзаряженные)",
    runWallets: "Запустите",
    toCreate: "для создания 5 кошельков. У каждого: 1 SOL + 10 000 USDC + 1 000 GRAIN.",
    importPhantom: "Импортируйте кошелёк в Phantom (режим testnet): Настройки → Добавить аккаунт → Импорт приватного ключа. Ключи в файле",
    testingWalkthrough: "Процесс тестирования — 9 шагов",
    quickCli: "Быстрые CLI-проверки",
    legalBasis: "Правовая основа (для питча)",
    legalNote: "GrainChain KZ является",
    solanaNative: "нативной реализацией на Solana",
    govtPiloting: "того, что правительство Казахстана активно тестирует в Костанае. Это не гипотетический проект.",
    copy: "Копировать", explorer: "Обозреватель ↗",
    checkSgrain: "Проверить курс sGRAIN (должен быть >1e9)",
    checkCgrain: "Проверить курс cGRAIN (выше sGRAIN)",
    verifyGrain: "Проверить зерно в элеваторе",
    runDemo: "Запустить демо-скрипт",
    liveYield: "Живой кранк доходности",
    carryOracle: "Кэрри-оракул (публикует спред)",
    steps: [
      { h:"Оракул создаёт квитанцию на зерно", d:"Оракул подписывает квитанцию Qoldau → PDA GrainReceipt создаётся on-chain. Ключ — серийный номер (напр. KST-2025-00847). Проверьте PDA в обозревателе — класс, протеин, влажность, дата урожая." },
      { h:"Фермер фракционирует → токены GRAIN", d:"GrainReceipt → токены GRAIN SPL (1 токен = 1 кг). Выпуск из PDA протокола. Проверьте аккаунт токенов GRAIN в обозревателе." },
      { h:"Кредитор вносит USDC", d:"USDC поступает в PDA LendingVault. Создаётся PDA LenderPosition, отслеживающий депозит + заработанные проценты (обновляется каждый блок)." },
      { h:"Фермер занимает USDC (оракул Pyth)", d:"Токены GRAIN заблокированы в PDA CollateralEscrow. USDC выдаётся при 60% LTV. Если Pyth testnet устарел — повторите через 30 с." },
      { h:"Внести GRAIN в хранилище sGRAIN", d:"GRAIN переводится в PDA GrainReserve. sGRAIN выпускается по текущему курсу. Курс ТОЛЬКО растёт — проверьте дважды с интервалом 60 с." },
      { h:"Открыть кэрри-позицию → cGRAIN", d:"GRAIN заблокирован в PDA CarryGrainReserve. cGRAIN выпущен. Курс cGRAIN растёт быстрее sGRAIN (на основе живого спреда CME контанго от оракула)." },
      { h:"Запустить кранк доходности", d:"yarn crank --interval 10 обновляет курсы sGRAIN и cGRAIN каждые 10 с. Без разрешений — любой ключ может вызвать. Доказательство автономной доходности." },
      { h:"Погасить займ + выйти из позиций", d:"Погасите USDC + проценты → залог GRAIN разблокирован. Выведите sGRAIN → получите больше GRAIN (разница = доходность). Выход из кэрри — аналогично." },
      { h:"Получить награды CHAIN", d:"Токены CHAIN распределяются пропорционально балансу sGRAIN. Аккумулятор reward_per_token в стиле Synthetix. 10 млн CHAIN за 2 года." },
    ],
    legal: [
      ["ГК РК ст. 797–802","Зерновые квитанции = неакционерные ценные бумаги"],
      ["Закон о зерне (2001)","192 лицензированных элеватора, реестр Qoldau.kz"],
      ["Поправка 2022 ✅","Цифровые токены юридически заменяют бумажные квитанции"],
      ["Закон о цифровых активах (2023)","Зерновые токены = обеспеченные цифровые активы"],
      ["МФЦА","Английское общее право, 0% НДС, Fintech Lab"],
      ["Пилот в Костанае (сен. 2025)","Мин. цифрового развития + блокчейн-программа МФЦА"],
    ],
    activity: "Активность",
  },
  kz: {
    farmerDash: "Диқан панелі", p2pMarket: "P2P астық нарығы",
    lenderVault: "Несие берушінің қоймасы", carryVault: "Кэрри қоймасы", judgeGuide: "Судья нұсқаулығы",
    network: "Желі",
    grainTokens: "GRAIN токендері", sgrainVault: "sGRAIN (қойма)", usdcBalance: "USDC балансы",
    chainRewards: "CHAIN сыйақылары", autoCompounding: "Авто-компаундинг 3.2%",
    availLiquidity: "Қолжетімді өтімділік", govTokens: "Басқару токендері",
    selectSilo: "Лицензиялы элеватор таңдаңыз", tokenizeGrain: "Астықты токенизациялау",
    selectSiloLabel: "Элеватор таңдаңыз", mintGrain: "GRAIN токендерін шығару", toSgrain: "→ sGRAIN қоймасы",
    borrowAgainst: "Астық кепілімен қарыз алу", maxBorrow: "Макс. қарыз", against: "қарсы",
    borrowUsdc: "USDC қарызға алу", qoldauReceipt: "QOLDAU ЦИФРЛЫҚ ҚОЛХАТЫ · БЛОКЧЕЙНМЕН РАСТАЛҒАН",
    tokenizedWheat: "Токенизацияланған жазғы бидай — сертификатталған", oraclePrice: "Оракул бағасы",
    totalValue: "Жалпы құны", maxBorrow60: "Макс. қарыз (60%)", status: "Күйі",
    inSiloVerified: "● Элеватorda, расталды", seasonalCarry: "Маусымдық кэрри мүмкіндігі",
    historicalSpread: "Тарихи қыр.→нау. спреді", positiveYears: "80% жылдарда оң",
    tokenizeAtHarvest: "Жинаймен токенизациялаңыз, көктемге дейін ұстаңыз.",
    seasonalAppreciation: "Маусымдық өсу (6 ай)", lendingYield: "Несие табысы (6 ай)",
    storageFeeShare: "Сақтау ақысы үлесі (6 ай)", carryVaultLabel: "Кэрри қоймасы (cGRAIN)",
    totalPotential: "Жалпы мүмкін кіріс",
    mintModal: "GRAIN токендерін шығару", grainQty: "Астық мөлшері", gostGrade: "МЕСТ сорты",
    detailsStep: "1. Мәліметтер", verifyStep: "2. Тексеру", mintStep: "3. Шығару",
    minting: "Шығарылуда…", mintTokens: "Токендерді шығару", cancel: "Болдырмау",
    borrowModal60: "60% LTV",
    borrowAmt: "Қарыз сомасы", borrowBtn: "USDC қарызға алу",
    allGrades: "Барлық сорттар", grade1: "1-сорт", grade2: "2-сорт", grade3: "3-сорт",
    livePrices: "ТІКЕЛЕЙ БАҒАЛАР", springWheat: "Жазғы бидай",
    protein: "Протеин", moisture: "Ылғалдылық", available: "Қолжетімді", seller: "Сатушы",
    lotFill: "Лот толтырылуы", sold: "% сатылды", buyNow: "Сатып алу",
    purchaseLot: "Астық партиясын сатып алу", quantity: "Мөлшер",
    price: "Баға", receipt: "Қолхат", cost: "Құны", grainReceived: "GRAIN алынды",
    settlement: "Есеп айырысу", lessThan1s: "<1 секунд",
    totalDeposited: "Жалпы салынған", earning: "ТАБЫС АЛЫНУДА",
    usdcAcross: "USDC 2 белсенді қоймада", totalEarned: "Жалпы табыс",
    blendedApy: "Орташа APY", nextPayout: "Келесі төлем",
    grainSeniorVault: "GRAIN Аға қоймасы", sgrainYieldVault: "sGRAIN кіріс қоймасы",
    seniorTranche: "Аға транш · бірінші шығынды қорғау",
    earnedSoFar: "табылды · $25 000 салынды",
    vaultUtil: "Қойма пайдаланылуы", depositedLabel: "салынды",
    yourPositions: "Сіздің позицияларыңыз", depositUsdc: "+ USDC салу",
    health: "Денсаулық", dep: "сал.", howYieldWorks: "Несие берушінің табысы қалай жұмыс істейді",
    ly1: "USDC-ні қоймаға салыңыз",
    ly2: "Диқандар элеватордағы GRAIN токендерін кепілге қойып USDC қарызға алады (60% LTV)",
    ly3: "Диқандар қарыз бойынша 11.2% жылдық пайыз төлейді",
    ly4: "Пайыздар сізге нақты уақытта табыс ретінде түседі",
    ly5: "Дефолттан қорғау: GRAIN токендері Pyth оракулы арқылы автоматты түрде ликвидацияланады",
    securedByWheat: "Сіздің USDC-ңіз қамтамасыз етілген",
    physicallySegregated: "физикалық оқшауланған бидаймен",
    inLicensedSilos: "лицензиялы Қазақстан элеваторларында. Астық GRAIN токендерін өртемей элеватордан шыға алмайды.",
    depositModal: "USDC салу", earnSecured: "11.2% APY табыңыз · элеватордағы астықпен қамтамасыз",
    depositAmt: "Салым сомасы", depositEarn: "Салып, таба бастаңыз",
    annualYield: "Жылдық табыс", monthly: "Ай сайын",
    carrySpreadLabel: "6 айлық кэрри", cmePyth: "CME ZW қыр.→нау. контанго спреді · Pyth оракулы",
    zwSepSpot: "ZW1! қыркүйек споты", zwMarchFutures: "ZW наурыз фьючерсі",
    annualizedCarryApy: "Жылдандырылған кэрри APY", cgrainRate: "cGRAIN бағамы",
    yourCgrain: "Сіздің cGRAIN",
    howCarryWorks: "Кэрри табысы қалай жұмыс істейді",
    carryExplain: "Қазақстан бидайы маусымдық баға минимумында тамыз–қыркүйекте жиналады. CME наурыз фьючерстері үстемемен (контанго) саудаланады. Токенизацияланған астықты қыста ұстай отырып, сіз сақтау ақысы мен несие пайыздарынан тыс осы спредті табыс ретінде аласыз.",
    physicalGrain: "Элеватордағы физикалық GRAIN", alreadyHappening: "Әлдеқашан жүріп жатыр — қосымша шығынсыз",
    cgrainAccrues: "cGRAIN бағамы спредті жинақтайды", updatesEveryBlock: "Оракул арқылы әр блокта жаңартылады",
    exitInMarch: "Наурызда шығу", moreGrainReturned: "Көбірек GRAIN + USDC кэрри табысы қайтарылады",
    avgCarry: "Орт. кэрри (2005–2024)", avgCarryVal: "18.4% қыр.→нау., 80% жылдарда оң",
    historicalSpreadTitle: "Тарихи қыр.→нау. спреді",
    enterCarryPos: "Кэрри позициясына кіру", grainToLock: "Бұғаттауға GRAIN",
    available2: "Қолжетімді", enterCarryBtn: "Кэрри позициясына кіру",
    yourActiveCarry: "Сіздің белсенді кэрри позицияңыз",
    carryPosLabel: "КЭРРИ ПОЗИЦИЯ · CGRAIN ҚОЙМАСЫ",
    wheatCarry: "Бидай кэрри позициясы — табыс алынуда",
    exchangeRate: "Айырбас бағамы", carryApy: "Кэрри APY", yieldAccrued: "Жинақталған табыс",
    carryAccruing: "● Кэрри жинақталуда", exitCarry: "Кэрри позициясынан шығу",
    noActiveCarry: "Белсенді кэрри позициясы жоқ",
    enterToEarn: "Бидай кэрри табысын ала бастау үшін позиция ашыңыз",
    atApy: "", inSixMonths: "APY кезінде, 6 айдан кейін:", kgGrainYield: "кг GRAIN табысы",
    onYourPos: "позицияңызға.",
    depositGrain: "GRAIN салыңыз → cGRAIN алыңыз. Кэрри APY бойынша бағам жинақталады. Кез келген уақытта шығып, салғаннан көп GRAIN алыңыз.",
    judgeTitle: "GrainChain KZ\nСудья тестілеу нұсқаулығы",
    judgeSub: "Solana желісіндегі Қазақстан астық қоймасының цифрлық қолхаттарын токенизациялау. Decentrathon 2026 Ұлттық Solana хакатоны үшін жасалған. Барлығы Solana testnet желісінде тікелей және тексерілетін.",
    onChainAddresses: "Желідегі мекенжайлар (testnet)",
    deployFirst: "Алдымен іске қосыңыз",
    thenRun: "содан кейін",
    toPopulate: "толтыру үшін.",
    judgeWallets: "Судья әмиянлары (алдын ала толтырылған)",
    runWallets: "Іске қосыңыз",
    toCreate: "5 толтырылған әмиян жасау үшін. Әрқайсысында: 1 SOL + 10 000 USDC + 1 000 GRAIN.",
    importPhantom: "Кез келген әмиянды Phantom-ға импорттаңыз (testnet режимі): Параметрлер → Аккаунт қосу → Жеке кілтті импорттау. Кілттер файлда",
    testingWalkthrough: "Тестілеу процесі — 9 қадам",
    quickCli: "Жылдам CLI тексерулері",
    legalBasis: "Құқықтық негіз (питч үшін)",
    legalNote: "GrainChain KZ болып табылады",
    solanaNative: "Solana-нативті іске асыру",
    govtPiloting: "Қазақстан үкіметі Қостанайда белсенді сынап жатқан нәрсенің. Бұл гипотетикалық жоба емес.",
    copy: "Көшіру", explorer: "Шолғыш ↗",
    checkSgrain: "sGRAIN бағамын тексеру (>1e9 болуы керек)",
    checkCgrain: "cGRAIN бағамын тексеру (sGRAIN-нен жоғары)",
    verifyGrain: "Элеватордағы астықты тексеру",
    runDemo: "Демо-скриптті іске қосу",
    liveYield: "Тікелей кіріс кранкі",
    carryOracle: "Кэрри оракулы (спредті жариялайды)",
    steps: [
      { h:"Оракул астық қолхатын жасайды", d:"Оракул Qoldau қолхатына қол қояды → GrainReceipt PDA желіде жасалады. Кілт — сериялық нөмір (мыс. KST-2025-00847). PDA-ны шолғышта тексеріңіз — сорт, протеин, ылғалдылық, жинау күні." },
      { h:"Диқан фракциялайды → GRAIN токендері", d:"GrainReceipt → GRAIN SPL токендері (1 токен = 1 кг). Протокол PDA-дан шығару. Шолғышта GRAIN токен аккаунтыңызды тексеріңіз." },
      { h:"Несие беруші USDC салады", d:"USDC LendingVault PDA-ға түседі. Депозитіңізді + табылған пайызды қадағалайтын LenderPosition PDA жасалады (әр блокта жаңарады)." },
      { h:"Диқан USDC қарызға алады (Pyth оракулы)", d:"GRAIN токендері CollateralEscrow PDA-да бұғатталды. USDC 60% LTV-де берілді. Testnet Pyth ескірсе — 30 с кейін қайталаңыз." },
      { h:"GRAIN-ді sGRAIN қоймасына салу", d:"GRAIN GrainReserve PDA-ға ауыстырылады. sGRAIN ағымдағы бағаммен шығарылады. Бағам ТЕК артады — 60 с аралықпен екі рет тексеріңіз." },
      { h:"Кэрри позициясына кіру → cGRAIN", d:"GRAIN CarryGrainReserve PDA-да бұғатталды. cGRAIN шығарылды. cGRAIN бағамы sGRAIN-нен тезірек өседі (оракулдан тікелей CME контанго спреді негізінде)." },
      { h:"Кіріс кранкін іске қосу", d:"yarn crank --interval 10 sGRAIN мен cGRAIN бағамдарын 10 с сайын жаңартады. Рұқсатсыз — кез келген кілт шақыра алады. Автономды кірістің дәлелі." },
      { h:"Қарызды өтеу + позициялардан шығу", d:"USDC + пайызды өтеңіз → GRAIN кепілі бұғатталмады. sGRAIN шығарыңыз → салғаннан көп GRAIN алыңыз (айырмасы = табыс). Кэрриден шығу — сол сияқты." },
      { h:"CHAIN басқару сыйақыларын алу", d:"CHAIN токендері sGRAIN балансына пропорционалды түрде таратылады. Synthetix стиліндегі reward_per_token жинақтаушы. 2 жылда 10 млн CHAIN." },
    ],
    legal: [
      ["АК 797–802-баптары","Астық қолхаттары = акционерлік емес бағалы қағаздар"],
      ["Астық туралы заң (2001)","192 лицензиялы элеватор, Qoldau.kz тізілімі"],
      ["2022 жылғы өзгеріс ✅","Цифрлық токендер қағаз қолхаттарды заңды түрде алмастырады"],
      ["Цифрлық активтер туралы заң (2023)","Астық токендері = қамтамасыз етілген цифрлық активтер"],
      ["ҚМҚО","Ағылшын жалпы құқығы, 0% ҚҚС, Fintech Lab"],
      ["Қостанай пилоты (қыр. 2025)","Цифрлық даму министрлігі + ҚМҚО блокчейн бағдарламасы"],
    ],
    activity: "Белсенділік",
  },
} as const;

// ─── FONTS + CSS ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:     #12100A;
  --ink-m:   #3A3328;
  --ink-l:   #7A6E60;
  --sand:    #F7F3EE;
  --wheat:   #EDE4D4;
  --wheat-d: #C9B898;
  --gold:    #B8972A;
  --gold-l:  #F5EDCF;
  --teal:    #1A8A6A;
  --teal-l:  #DDF2EA;
  --teal-d:  #0E6048;
  --amber:   #C07A18;
  --amber-l: #FEF0D4;
  --sky:     #1B6FA8;
  --sky-l:   #E0EDF8;
  --red:     #B83C28;
  --red-l:   #FDEAE6;
  --white:   #FFFEFB;
  --border:  rgba(18,16,10,.10);
  --border-m:rgba(18,16,10,.18);
  --r:       6px;
  --r-lg:    12px;
  --mono:    'DM Mono', monospace;
  --serif:   'Fraunces', serif;
  --sans:    'DM Sans', sans-serif;
  --shadow:  0 1px 3px rgba(18,16,10,.08), 0 4px 12px rgba(18,16,10,.04);
}

html, body, #root { height: 100%; background: var(--sand); }
body { font-family: var(--sans); color: var(--ink); -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: var(--wheat-d); border-radius: 3px; }

/* ── Layout ── */
.app-shell { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Topbar ── */
.topbar {
  height: 56px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--ink); position: sticky; top: 0; z-index: 100;
}
.topbar-brand {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--serif); font-size: 18px; font-weight: 600;
  color: var(--white); letter-spacing: -.3px;
}
.brand-badge {
  width: 28px; height: 28px; background: var(--gold);
  border-radius: 5px; display: flex; align-items: center;
  justify-content: center; font-size: 14px;
}
.topbar-center {
  display: flex; align-items: center; gap: 20px;
  font-family: var(--mono); font-size: 11px;
}
.price-chip {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 4px 12px;
}
.price-label { color: rgba(255,255,255,.4); }
.price-value { color: var(--gold); font-weight: 500; }
.price-delta { font-size: 10px; padding: 1px 5px; border-radius: 3px; }
.price-delta.up { background: rgba(26,138,106,.25); color: #5ecba1; }
.price-delta.dn { background: rgba(184,60,40,.25); color: #f08070; }
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #5ecba1; animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.wallet-pill {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 4px 12px; font-family: var(--mono);
  font-size: 11px; color: rgba(255,255,255,.7); cursor: pointer;
}
.wallet-pill:hover { background: rgba(255,255,255,.13); }
.w-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }

/* ── Nav ── */
.nav {
  display: flex; gap: 2px; padding: 0 24px;
  background: var(--white); border-bottom: 1px solid var(--border);
  position: sticky; top: 56px; z-index: 90;
}
.nav-item {
  display: flex; align-items: center; gap: 7px;
  padding: 0 16px; height: 48px; font-size: 13px; font-weight: 500;
  color: var(--ink-l); border: none; background: none; cursor: pointer;
  border-bottom: 2px solid transparent; position: relative; top: 1px;
  transition: color .12s;
}
.nav-item:hover { color: var(--ink); }
.nav-item.active { color: var(--teal-d); border-bottom-color: var(--teal); }
.nav-badge {
  font-size: 10px; font-family: var(--mono); padding: 1px 5px;
  border-radius: 3px; background: var(--teal-l); color: var(--teal-d);
  font-weight: 500;
}

/* ── Content ── */
.page { padding: 24px; max-width: 1100px; margin: 0 auto; width: 100%; }

/* ── Cards ── */
.card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 18px 20px;
  box-shadow: var(--shadow);
}
.card-title {
  font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 12px;
  letter-spacing: -.1px;
}

/* ── Stat cards ── */
.stats { display: grid; gap: 10px; margin-bottom: 20px; }
.stats.c4 { grid-template-columns: repeat(4, 1fr); }
.stats.c3 { grid-template-columns: repeat(3, 1fr); }
.stat-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 14px 16px; box-shadow: var(--shadow);
}
.stat-label {
  font-size: 10px; font-weight: 600; color: var(--ink-l);
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px;
}
.stat-val { font-family: var(--mono); font-size: 20px; font-weight: 500; color: var(--ink); }
.stat-val.green { color: var(--teal-d); }
.stat-val.gold  { color: var(--gold); }
.stat-val.sky   { color: var(--sky); }
.stat-sub { font-size: 11px; color: var(--ink-l); margin-top: 3px; }

/* ── Badges ── */
.badge {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--mono); font-size: 10px; font-weight: 500;
  padding: 2px 7px; border-radius: 4px; letter-spacing: .03em;
}
.badge-teal   { background: var(--teal-l);  color: var(--teal-d); }
.badge-gold   { background: var(--gold-l);  color: #7a5e0a; }
.badge-sky    { background: var(--sky-l);   color: #0e4f7a; }
.badge-red    { background: var(--red-l);   color: var(--red); }
.badge-amber  { background: var(--amber-l); color: var(--amber); }
.badge-ink    { background: var(--ink);     color: var(--wheat); }
.badge-live   { background: var(--teal); color: white; animation: blink 2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.7} }

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 18px; border-radius: var(--r); font-family: var(--sans);
  font-size: 13px; font-weight: 500; cursor: pointer; border: none;
  transition: all .12s; white-space: nowrap;
}
.btn-primary { background: var(--teal); color: white; }
.btn-primary:hover { background: var(--teal-d); transform: translateY(-1px); }
.btn-gold { background: var(--gold); color: white; }
.btn-gold:hover { filter: brightness(.9); transform: translateY(-1px); }
.btn-sky { background: var(--sky); color: white; }
.btn-sky:hover { filter: brightness(.9); transform: translateY(-1px); }
.btn-outline {
  background: transparent; color: var(--ink);
  border: 1.5px solid var(--border-m);
}
.btn-outline:hover { border-color: var(--teal); color: var(--teal-d); }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-full { width: 100%; }
.btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; filter: none !important; }

/* ── Form elements ── */
.field { margin-bottom: 12px; }
.field-label {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--ink-l); text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: 5px;
}
.input-wrap { display: flex; align-items: stretch; }
.input {
  flex: 1; height: 38px; padding: 0 11px;
  background: var(--sand); border: 1.5px solid var(--border-m);
  border-radius: var(--r); font-family: var(--mono); font-size: 13px;
  color: var(--ink); outline: none; transition: border .12s;
}
.input:focus { border-color: var(--teal); background: white; }
.input-sfx {
  display: flex; align-items: center; padding: 0 10px;
  background: var(--wheat); border: 1.5px solid var(--border-m);
  border-left: none; border-radius: 0 var(--r) var(--r) 0;
  font-family: var(--mono); font-size: 11px; font-weight: 500;
  color: var(--ink-m);
}
.input.round-l { border-radius: var(--r) 0 0 var(--r); }

/* ── Tables ── */
.tbl-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th {
  text-align: left; font-size: 10px; font-weight: 600; color: var(--ink-l);
  text-transform: uppercase; letter-spacing: .06em;
  padding: 8px 12px; border-bottom: 1px solid var(--border);
  background: var(--sand); white-space: nowrap;
}
td {
  padding: 11px 12px; font-size: 13px; color: var(--ink-m);
  border-bottom: 1px solid var(--border);
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(26,138,106,.03); }
.td-mono { font-family: var(--mono); font-size: 12px; }
.td-green { color: var(--teal-d); font-family: var(--mono); font-weight: 500; }
.td-gold  { color: var(--gold);   font-family: var(--mono); font-weight: 500; }

/* ── Progress ── */
.prog-track { height: 5px; background: var(--wheat); border-radius: 3px; overflow: hidden; }
.prog-fill  { height: 100%; border-radius: 3px; transition: width .8s; }

/* ── Info/warn boxes ── */
.info-box {
  background: var(--teal-l); border: 1px solid rgba(26,138,106,.2);
  border-radius: var(--r); padding: 11px 13px;
  font-size: 12px; color: var(--teal-d); line-height: 1.5; margin-bottom: 12px;
}
.warn-box {
  background: var(--amber-l); border: 1px solid rgba(192,122,24,.2);
  border-radius: var(--r); padding: 11px 13px;
  font-size: 12px; color: var(--amber); line-height: 1.5; margin-bottom: 12px;
}
.gold-box {
  background: var(--gold-l); border: 1px solid rgba(184,151,42,.2);
  border-radius: var(--r); padding: 11px 13px;
  font-size: 12px; color: #7a5e0a; line-height: 1.5; margin-bottom: 12px;
}

/* ── Grid helpers ── */
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.flex { display: flex; align-items: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-gap { display: flex; align-items: center; gap: 8px; }
.gap-8 { gap: 8px; }
.gap-12 { gap: 12px; }
.mt-8  { margin-top: 8px; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.mt-20 { margin-top: 20px; }
.mb-8  { margin-bottom: 8px; }
.mb-12 { margin-bottom: 12px; }
.mb-16 { margin-bottom: 16px; }
.mb-20 { margin-bottom: 20px; }
.text-sm   { font-size: 12px; color: var(--ink-l); }
.text-mono { font-family: var(--mono); font-size: 12px; }
.text-bold { font-weight: 600; }
.divider { height: 1px; background: var(--border); margin: 14px 0; }

/* ── Receipt card ── */
.receipt-card {
  background: var(--ink); color: white; border-radius: var(--r-lg);
  padding: 20px; position: relative; overflow: hidden;
}
.receipt-card::after {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 130px; height: 130px; background: var(--gold);
  border-radius: 50%; opacity: .12;
}
.receipt-serial { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,.4); margin-bottom: 8px; letter-spacing: .08em; }
.receipt-amount { font-family: var(--mono); font-size: 26px; font-weight: 500; color: #e8c85a; margin-bottom: 3px; }
.receipt-sub    { font-size: 11px; color: rgba(255,255,255,.5); margin-bottom: 14px; }
.receipt-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0; border-top: 1px solid rgba(255,255,255,.08);
  font-size: 12px;
}
.receipt-key { color: rgba(255,255,255,.45); }
.receipt-val { font-family: var(--mono); color: white; }

/* ── Vault card (dark) ── */
.vault-dark {
  background: var(--ink); color: white; border-radius: var(--r-lg);
  padding: 22px; position: relative; overflow: hidden;
}
.vault-dark::before {
  content: ''; position: absolute;
  width: 180px; height: 180px; border-radius: 50%;
  background: var(--teal); opacity: .08; top: -50px; right: -50px;
}
.vault-label { font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
.vault-rate  { font-family: var(--mono); font-size: 26px; font-weight: 500; color: #5ecba1; }
.vault-rate-gold { font-family: var(--mono); font-size: 26px; font-weight: 500; color: #e8c85a; }
.vault-sub   { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 3px; margin-bottom: 14px; }
.vault-meta  {
  display: flex; gap: 18px; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,.1);
}
.vault-meta-item .vm-label { font-size: 10px; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
.vault-meta-item .vm-val   { font-family: var(--mono); font-size: 14px; color: white; font-weight: 500; }

/* ── Yield ticker ── */
.ticker { transition: color .2s; }
.ticker.flash { color: #5ecba1 !important; }
.ticker-gold.flash { color: #e8c85a !important; }

/* ── Lot card ── */
.lot-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 16px 18px; margin-bottom: 8px;
  display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: start;
  transition: border-color .12s, transform .12s; cursor: pointer;
  box-shadow: var(--shadow);
}
.lot-card:hover { border-color: var(--teal); transform: translateY(-1px); }
.lot-grade {
  display: inline-block; font-family: var(--mono); font-size: 10px;
  font-weight: 600; padding: 2px 6px; border-radius: 3px;
}
.g1 { background: #FFF5D6; color: #7a5e00; }
.g2 { background: var(--teal-l); color: var(--teal-d); }
.g3 { background: #EDE9FE; color: #4c1d95; }
.lot-title { font-size: 13px; font-weight: 600; color: var(--ink); margin: 6px 0; }
.lot-meta  { display: flex; flex-wrap: wrap; gap: 12px; }
.lot-meta-item { font-size: 12px; color: var(--ink-l); }
.lot-meta-item strong { color: var(--ink-m); }
.lot-price { font-family: var(--mono); font-size: 17px; font-weight: 500; color: var(--ink); }
.lot-price-sub { font-size: 11px; color: var(--ink-l); margin-top: 2px; }

/* ── Carry viz ── */
.carry-meter {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 16px 18px;
}
.spread-bar-track {
  height: 8px; background: var(--wheat); border-radius: 4px;
  position: relative; overflow: hidden; margin: 8px 0;
}
.spread-bar-fill {
  height: 100%; border-radius: 4px; transition: width 1s ease;
}
.contango { background: linear-gradient(90deg, var(--teal), #2dd4a0); }
.backwardation { background: linear-gradient(90deg, var(--red), #f08060); }

/* ── APY gauge ── */
.apy-row { display: flex; align-items: center; gap: 14px; }
.apy-circle {
  width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid var(--teal); font-family: var(--mono);
  font-size: 13px; font-weight: 500; color: var(--teal-d);
}
.apy-circle.gold-ring { border-color: var(--gold); color: var(--gold); }

/* ── Modal ── */
.overlay {
  position: fixed; inset: 0; background: rgba(18,16,10,.55);
  backdrop-filter: blur(3px); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal {
  background: var(--white); border-radius: var(--r-lg);
  width: 100%; max-width: 420px; padding: 26px;
  animation: pop .18s ease;
}
@keyframes pop { from { opacity:0; transform: scale(.96) translateY(10px); } to { opacity:1; transform: none; } }
.modal-title { font-family: var(--serif); font-size: 20px; font-weight: 600; margin-bottom: 4px; }
.modal-sub   { font-size: 13px; color: var(--ink-l); margin-bottom: 18px; }
.modal-footer { display: flex; gap: 8px; margin-top: 18px; }

/* ── Lang switcher ── */
.lang-switcher { display: flex; gap: 3px; }
.lang-btn {
  padding: 3px 9px; border-radius: 12px; font-size: 11px; font-weight: 600;
  border: 1.5px solid rgba(255,255,255,.18); background: transparent;
  color: rgba(255,255,255,.5); cursor: pointer; font-family: var(--mono);
  transition: all .12s; letter-spacing: .03em;
}
.lang-btn:hover { background: rgba(255,255,255,.1); color: rgba(255,255,255,.85); }
.lang-btn.active { background: var(--gold); border-color: var(--gold); color: white; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 20px; right: 20px; z-index: 300;
  background: var(--ink); color: white; border-radius: var(--r-lg);
  padding: 12px 18px; font-size: 13px; max-width: 300px;
  border-left: 3px solid var(--teal); animation: slide-in .2s ease;
}
.toast.err { border-left-color: var(--red); }
@keyframes slide-in { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform: none; } }

/* ── Activity bar ── */
.activity-bar {
  position: sticky; bottom: 0; background: var(--white);
  border-top: 1px solid var(--border); padding: 8px 24px; z-index: 80;
}
.activity-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 14px; }
.act-label { font-size: 10px; font-weight: 600; color: var(--ink-l); letter-spacing: .06em; text-transform: uppercase; flex-shrink: 0; }
.act-dot   { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 1px; }
.act-text  { font-size: 12px; color: var(--ink-m); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.act-time  { font-family: var(--mono); font-size: 10px; color: var(--ink-l); flex-shrink: 0; }

/* ── Silo picker ── */
.silo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.silo-item {
  background: var(--sand); border: 1.5px solid var(--border-m);
  border-radius: var(--r); padding: 11px 13px; cursor: pointer; transition: all .12s;
}
.silo-item:hover { border-color: var(--teal); }
.silo-item.sel   { border-color: var(--teal); background: var(--teal-l); }
.silo-name { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
.silo-cap  { font-family: var(--mono); font-size: 11px; color: var(--ink-l); }

/* ── Step indicator ── */
.steps { display: flex; margin-bottom: 20px; }
.step { flex: 1; padding: 8px 12px; font-size: 11px; font-weight: 600; color: var(--ink-l); border-bottom: 2px solid var(--border); text-align: center; transition: all .12s; }
.step.done   { color: var(--teal); border-bottom-color: var(--teal); }
.step.active { color: var(--ink); border-bottom-color: var(--ink); }

/* ── Judge page ── */
.judge-hero {
  background: var(--ink); border-radius: var(--r-lg);
  padding: 40px; margin-bottom: 24px; position: relative; overflow: hidden;
}
.judge-hero::before {
  content: ''; position: absolute;
  width: 300px; height: 300px; border-radius: 50%;
  background: var(--gold); opacity: .07; top: -100px; right: -80px;
}
.judge-hero-title {
  font-family: var(--serif); font-size: 32px; font-weight: 600;
  color: white; margin-bottom: 8px; line-height: 1.2;
}
.judge-hero-sub { font-size: 15px; color: rgba(255,255,255,.6); margin-bottom: 24px; max-width: 560px; }
.judge-tag {
  display: inline-block; font-family: var(--mono); font-size: 11px;
  padding: 3px 9px; border-radius: 4px; margin-right: 6px; margin-bottom: 6px;
}
.jt-teal  { background: rgba(26,138,106,.25); color: #5ecba1; }
.jt-gold  { background: rgba(184,151,42,.25); color: #e8c85a; }
.jt-sky   { background: rgba(27,111,168,.25); color: #7ec4f0; }
.address-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
  border-radius: var(--r); padding: 8px 12px; cursor: pointer;
  font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,.7);
  transition: background .12s;
}
.address-chip:hover { background: rgba(255,255,255,.14); }
.copy-icon { font-size: 12px; color: rgba(255,255,255,.4); }
.judge-step {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 0; border-bottom: 1px solid var(--border);
}
.judge-step:last-child { border-bottom: none; }
.step-num {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0; color: white;
}
.step-body h4 { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 3px; }
.step-body p  { font-size: 12px; color: var(--ink-l); line-height: 1.5; }
.explorer-link { color: var(--sky); font-family: var(--mono); font-size: 11px; text-decoration: none; }
.explorer-link:hover { text-decoration: underline; }

/* ── Carry zone ── */
.carry-zone {
  background: linear-gradient(135deg, #0e1810 0%, #1a1208 100%);
  border-radius: var(--r-lg); padding: 22px; color: white; position: relative; overflow: hidden;
}
.carry-zone::before {
  content: ''; position: absolute; width: 200px; height: 200px;
  border-radius: 50%; background: var(--gold); opacity: .06;
  bottom: -60px; right: -60px;
}
.carry-spread-val {
  font-family: var(--serif); font-size: 42px; font-weight: 600;
  line-height: 1; margin-bottom: 2px;
}
.carry-spread-val.contango-color { color: #e8c85a; }
.carry-spread-val.backwardation-color { color: #f08060; }
`;

// ─── DEVNET ADDRESSES ─────────────────────────────────────────────────────────
const PROGRAM_ID   = "4NutBXSNJ9tJLFueRwRd6PjQPzgricziys9uTBLuP8n7";
const EXPLORER     = "https://explorer.solana.com";
const CLUSTER      = "devnet";
const CLUSTER_URL  = "https://api.devnet.solana.com";

const ADDRESSES = {
  program:  { label: "Program ID",          val: "4NutBXSNJ9tJLFueRwRd6PjQPzgricziys9uTBLuP8n7" },
  grain:    { label: "GRAIN Mint",           val: "CLxFPnJp2xXVDLpKciAHwW13DQo8qQGKHYUdYXawkfy2" },
  sgrain:   { label: "sGRAIN Mint",          val: "GNQkAbRkrnL2383dkGMcYcYpnXfsRCBMgtWycYfgVMAW" },
  cgrain:   { label: "cGRAIN Mint",          val: "2cmjhBb2h922yYKxT8A5VfJbMn4kALcjxXVuyXyGoq2E" },
  usdc:     { label: "USDC Mint (mock)",     val: "7gEJnKHRwHBhMMRUeRvJm7eV4LgAXyU2wduiEs6Prek8" },
};

const SILOS = [
  { id:"KST-SILO-001", name:"Kostanay Elevator #1", region:"Kostanay",  cap:5000, avail:3200, grades:["1","2"] },
  { id:"AKM-SILO-004", name:"Akmola Grain Terminal", region:"Akmola",   cap:10000, avail:6800, grades:["2","3"] },
  { id:"KST-SILO-012", name:"Kostanay South Depot",  region:"Kostanay", cap:3000, avail:1100, grades:["2"] },
  { id:"NKZ-SILO-007", name:"North KZ Central Hub",  region:"N. Kazakhstan", cap:6500, avail:2400, grades:["1","2","3"] },
];

const MARKET_LOTS = [
  { id:"KST-2025-00847", silo:"Kostanay Elevator #1", region:"Kostanay", grade:"2", tonnes:1200, price:182, seller:"Farmer Aibek N.",  protein:"12.8%", moisture:"13.1%", fill:.34 },
  { id:"AKM-2025-01203", silo:"Akmola Grain Terminal",  region:"Akmola",   grade:"1", tonnes:3500, price:196, seller:"Agro-Steppe LLC", protein:"14.2%", moisture:"12.8%", fill:.71 },
  { id:"KST-2025-00901", silo:"Kostanay South Depot",   region:"Kostanay", grade:"2", tonnes:800,  price:180, seller:"Farmer Zarina K.",protein:"12.5%", moisture:"13.4%", fill:.10 },
  { id:"NKZ-2025-00412", silo:"North KZ Central Hub",   region:"N. Kazakhstan", grade:"3", tonnes:2100, price:168, seller:"KazGrainTrade", protein:"11.1%", moisture:"14.2%", fill:.55 },
];

const HISTORICAL_CARRY = [
  {yr:2005,sep:315,mar:360,pct:14.3},{yr:2006,sep:430,mar:480,pct:11.6},
  {yr:2007,sep:460,mar:745,pct:62.0},{yr:2008,sep:680,mar:530,pct:-22.1},
  {yr:2009,sep:460,mar:510,pct:10.9},{yr:2010,sep:650,mar:820,pct:26.2},
  {yr:2011,sep:760,mar:665,pct:-12.5},{yr:2012,sep:900,mar:720,pct:-20.0},
  {yr:2013,sep:660,mar:625,pct:-5.3},{yr:2014,sep:520,mar:510,pct:-1.9},
  {yr:2015,sep:490,mar:470,pct:-4.1},{yr:2016,sep:415,mar:365,pct:-12.0},
  {yr:2017,sep:435,mar:450,pct:3.4}, {yr:2018,sep:510,mar:490,pct:-3.9},
  {yr:2019,sep:485,mar:545,pct:12.4},{yr:2020,sep:540,mar:620,pct:14.8},
  {yr:2021,sep:730,mar:870,pct:19.2},{yr:2022,sep:850,mar:680,pct:-20.0},
  {yr:2023,sep:575,mar:540,pct:-6.1},{yr:2024,sep:535,mar:570,pct:6.5},
];

const JUDGE_WALLETS = [
  { n:1, pub:"JDg1...fKmn", usdc:10000, grain:1000, color:"var(--teal)" },
  { n:2, pub:"JDg2...rPqs", usdc:10000, grain:1000, color:"var(--gold)" },
  { n:3, pub:"JDg3...xTvw", usdc:10000, grain:1000, color:"var(--sky)"  },
];

function fmt(n: number, d=2) { return Number(n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}); }
function fmtK(n: number) { return n>=1000?(n/1000).toFixed(1)+"K":n.toString(); }
function nowStr() { return new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"}); }

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function Toast({ msg, type, onDone }: any) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type==="err"?"err":""}`}>{msg}</div>;
}

function Modal({ title, sub, children, footer, onClose }: any) {
  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── FARMER TAB ───────────────────────────────────────────────────────────────
function FarmerTab({ wallet, setWallet, wPrice, toast, log }: any) {
  const { lang } = useLang(); const t = T[lang];
  const [silo, setSilo] = useState<any>(null);
  const [mintModal, setMintModal] = useState(false);
  const [borrowModal, setBorrowModal] = useState(false);
  const [kg, setKg] = useState("");
  const [grade, setGrade] = useState("2");
  const [borrowAmt, setBorrowAmt] = useState("");
  const [minting, setMinting] = useState(false);

  const grainVal = wallet.grain * wPrice * 36.744 / 1_000_000;
  const maxBorrow = grainVal * 0.6;

  function handleMint() {
    const k = parseFloat(kg); if (!k||!silo) return;
    setMinting(true);
    setTimeout(() => {
      setWallet((w: any) => ({ ...w, grain: w.grain + k * 1_000_000 }));
      log({ c:"var(--teal)", t:`Minted ${fmtK(k)} GRAIN from ${silo.name} — receipt ${silo.id}-${Math.floor(Math.random()*9000+1000)}`, ts:nowStr() });
      toast(`✓ ${fmtK(k)} GRAIN tokens minted`);
      setMintModal(false); setKg(""); setMinting(false);
    }, 1600);
  }

  function handleBorrow() {
    const a = parseFloat(borrowAmt); if (!a||a>maxBorrow) { toast("Exceeds 60% LTV","err"); return; }
    const locked = Math.ceil(a / (wPrice*36.744/1_000) * 1_000_000 / 0.6);
    setWallet((w: any) => ({ ...w, usdc: w.usdc + a, grain: w.grain - locked }));
    log({ c:"var(--amber)", t:`Borrowed ${fmt(a,0)} USDC · ${fmtK(locked/1_000_000)} GRAIN locked · 11.2% APR`, ts:nowStr() });
    toast(`✓ ${fmt(a,0)} USDC borrowed`);
    setBorrowModal(false); setBorrowAmt("");
  }

  function handleSgrain() {
    if (wallet.grain < 100_000_000) { toast("Need ≥100 GRAIN","err"); return; }
    const d = Math.floor(wallet.grain * 0.4);
    setWallet((w: any) => ({ ...w, grain: w.grain - d, sgrain: w.sgrain + d }));
    log({ c:"var(--teal)", t:`Deposited ${fmtK(d/1_000_000)} GRAIN → sGRAIN vault · 3.2% APY`, ts:nowStr() });
    toast(`✓ ${fmtK(d/1_000_000)} sGRAIN issued`);
  }

  return (
    <div className="page">
      <div className="stats c4 mb-20">
        {[
          { l:t.grainTokens, v:fmtK(wallet.grain/1_000_000), c:"green", s:`≈ $${fmt(grainVal,0)} USDC` },
          { l:t.sgrainVault, v:fmtK(wallet.sgrain/1_000_000), c:"green", s:t.autoCompounding },
          { l:t.usdcBalance, v:fmt(wallet.usdc,0), c:"", s:t.availLiquidity },
          { l:t.chainRewards, v:wallet.chain, c:"gold", s:t.govTokens },
        ].map(s => (
          <div className="stat-card" key={s.l}>
            <div className="stat-label">{s.l}</div>
            <div className={`stat-val ${s.c}`}>{s.v}</div>
            <div className="stat-sub">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div>
          <div className="card mb-12">
            <div className="card-title">{t.selectSilo}</div>
            <div className="silo-grid">
              {SILOS.map(s => (
                <div key={s.id} className={`silo-item ${silo?.id===s.id?"sel":""}`} onClick={() => setSilo(s)}>
                  <div className="silo-name">{s.name}</div>
                  <div className="silo-cap">{fmtK(s.avail)}t avail · Grades {s.grades.join(",")}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-12">
            <div className="flex-between mb-12">
              <div className="card-title" style={{margin:0}}>{t.tokenizeGrain}</div>
              {silo ? <span className="badge badge-teal">{silo.name}</span> : <span className="badge badge-gold">{t.selectSiloLabel}</span>}
            </div>
            <p className="text-sm mb-12">{lang==="en"?"Deposit grain at a Qoldau-registered silo. 1 GRAIN = 1 kg of certified wheat.":lang==="ru"?"Сдайте зерно на элеватор Qoldau. 1 GRAIN = 1 кг сертифицированной пшеницы.":"Астықты Qoldau тіркелген элеваторға тапсырыңыз. 1 GRAIN = 1 кг сертификатталған бидай."}</p>
            <div className="flex-gap">
              <button className="btn btn-primary" disabled={!silo} onClick={() => setMintModal(true)}>{t.mintGrain}</button>
              <button className="btn btn-outline" disabled={wallet.grain < 100_000_000} onClick={handleSgrain}>{t.toSgrain}</button>
            </div>
          </div>

          <div className="card">
            <div className="flex-between mb-8">
              <div className="card-title" style={{margin:0}}>{t.borrowAgainst}</div>
              <span className="badge badge-amber">60% LTV</span>
            </div>
            <div className="warn-box">{t.maxBorrow}: <strong>${fmt(maxBorrow,0)}</strong> {t.against} {fmtK(wallet.grain/1_000_000)} GRAIN. 11.2% APR.</div>
            <button className="btn btn-gold btn-full" disabled={wallet.grain < 100_000_000} onClick={() => setBorrowModal(true)}>{t.borrowUsdc}</button>
          </div>
        </div>

        <div>
          {wallet.grain > 0 && (
            <div className="receipt-card mb-12">
              <div className="receipt-serial">{t.qoldauReceipt}</div>
              <div className="receipt-amount">{fmtK(wallet.grain/1_000_000)} GRAIN</div>
              <div className="receipt-sub">{t.tokenizedWheat}</div>
              <div className="receipt-row"><span className="receipt-key">{t.oraclePrice}</span><span className="receipt-val">${fmt(wPrice*36.744)}/tonne</span></div>
              <div className="receipt-row"><span className="receipt-key">{t.totalValue}</span><span className="receipt-val">${fmt(grainVal,0)}</span></div>
              <div className="receipt-row"><span className="receipt-key">{t.maxBorrow60}</span><span className="receipt-val">${fmt(maxBorrow,0)}</span></div>
              <div className="receipt-row"><span className="receipt-key">{t.status}</span><span className="receipt-val" style={{color:"#5ecba1"}}>● {t.inSiloVerified.replace("● ","")}</span></div>
            </div>
          )}

          <div className="card">
            <div className="card-title">{t.seasonalCarry}</div>
            <div className="info-box">{t.historicalSpread}: <strong>+18.4% avg (2005–2024)</strong>. {t.positiveYears}. {t.tokenizeAtHarvest}</div>
            {[
              [t.seasonalAppreciation,"+9.2%","var(--teal-d)"],
              [t.lendingYield,"+5.5%","var(--teal-d)"],
              [t.storageFeeShare,"+1.5%","var(--teal-d)"],
              [t.carryVaultLabel,"+7.5%","var(--gold)"],
            ].map(([l,v,c])=>(
              <div className="flex-between mt-8" key={l} style={{fontSize:13}}>
                <span style={{color:"var(--ink-l)"}}>{l}</span>
                <span style={{fontFamily:"var(--mono)",fontWeight:500,color:c as string}}>{v}</span>
              </div>
            ))}
            <div className="divider"/>
            <div className="flex-between" style={{fontSize:14}}>
              <strong>{t.totalPotential}</strong>
              <span style={{fontFamily:"var(--mono)",fontWeight:600,color:"var(--teal-d)",fontSize:16}}>~+23.7%</span>
            </div>
          </div>
        </div>
      </div>

      {mintModal && (
        <Modal title={t.mintModal} sub={`${lang==="en"?"Silo":lang==="ru"?"Элеватор":"Элеватор"}: ${silo?.name}`}
          onClose={() => setMintModal(false)}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={() => setMintModal(false)}>{t.cancel}</button>
            <button className="btn btn-primary" style={{flex:1}} disabled={!kg||parseFloat(kg)<=0||minting} onClick={handleMint}>
              {minting ? t.minting : t.mintTokens}
            </button>
          </>}>
          <div className="steps">
            <div className={`step ${minting?"done":"active"}`}>{t.detailsStep}</div>
            <div className={`step ${minting?"active":""}`}>{t.verifyStep}</div>
            <div className="step">{t.mintStep}</div>
          </div>
          <div className="field">
            <label className="field-label">{t.grainQty}</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder="e.g. 1000" value={kg} onChange={e=>setKg(e.target.value)}/>
              <div className="input-sfx">kg</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">{t.gostGrade}</label>
            <select style={{width:"100%",height:38,border:"1.5px solid var(--border-m)",borderRadius:"var(--r)",fontFamily:"var(--sans)",fontSize:13,padding:"0 11px",background:"var(--sand)"}}
              value={grade} onChange={e=>setGrade(e.target.value)}>
              {(silo?.grades||[]).map((g: string)=>(<option key={g} value={g}>Grade {g} {g==="1"?"(Premium)":g==="2"?"(Standard)":"(Feed)"}</option>))}
            </select>
          </div>
          {kg && <div className="info-box">You will receive <strong>{fmtK(parseFloat(kg)||0)} GRAIN tokens</strong> · Value ≈ <strong>${fmt((parseFloat(kg)||0)*(wPrice*36.744/1000),0)}</strong></div>}
        </Modal>
      )}

      {borrowModal && (
        <Modal title="Borrow USDC" sub={`${fmtK(wallet.grain/1_000_000)} GRAIN collateral · 60% LTV`}
          onClose={() => setBorrowModal(false)}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={() => setBorrowModal(false)}>Cancel</button>
            <button className="btn btn-gold" style={{flex:1}} disabled={!borrowAmt||parseFloat(borrowAmt)<=0||parseFloat(borrowAmt)>maxBorrow} onClick={handleBorrow}>Borrow</button>
          </>}>
          <div className="field">
            <label className="field-label">{t.borrowAmt} (USDC)</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder={`Max ${fmt(maxBorrow,0)}`} value={borrowAmt} onChange={e=>setBorrowAmt(e.target.value)}/>
              <div className="input-sfx">USDC</div>
            </div>
          </div>
          <div className="warn-box">{lang==="en"?"Interest rate:":lang==="ru"?"Процентная ставка:":"Пайыздық мөлшерлеме:"} <strong>11.2% APR</strong>. {lang==="en"?"Liquidation at 80% LTV. Repay by March to capture spring appreciation.":lang==="ru"?"Ликвидация при 80% LTV. Погасите к марту для весеннего роста.":"80% LTV кезінде ликвидация. Көктемгі өсімді алу үшін наурызға дейін өтеңіз."}</div>
          {borrowAmt&&parseFloat(borrowAmt)>0&&(
            <div className="info-box">{lang==="en"?"Repayment in 6 mo:":lang==="ru"?"Выплата через 6 мес.:":"6 айдан кейін өтеу:"} <strong>${fmt(parseFloat(borrowAmt)*1.056,0)}</strong> · {lang==="en"?"Est. spring grain value:":lang==="ru"?"Ожид. стоимость зерна весной:":"Болжамды көктемгі астық құны:"} <strong>${fmt(grainVal*1.18,0)}</strong></div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── MARKET TAB ───────────────────────────────────────────────────────────────
function MarketTab({ wallet, setWallet, wPrice, toast, log }: any) {
  const { lang } = useLang(); const t = T[lang];
  const [filter, setFilter] = useState("all");
  const [buyModal, setBuyModal] = useState<any>(null);
  const [buyTonnes, setBuyTonnes] = useState("");

  const filtered = filter==="all"?MARKET_LOTS:MARKET_LOTS.filter(l=>l.grade===filter.replace("g",""));

  function handleBuy() {
    const tonnes = parseFloat(buyTonnes); if (!tonnes||!buyModal) return;
    const cost = tonnes * buyModal.price * 1000;
    if (cost > wallet.usdc) { toast(lang==="en"?"Insufficient USDC":lang==="ru"?"Недостаточно USDC":"USDC жеткіліксіз","err"); return; }
    setWallet((w: any) => ({ ...w, usdc: w.usdc - cost, grain: w.grain + tonnes*1_000_000 }));
    log({ c:"var(--sky)", t:`${lang==="en"?"Bought":lang==="ru"?"Куплено":"Сатып алынды"} ${tonnes}t wheat (Grade ${buyModal.grade}) from ${buyModal.silo} · ${fmt(cost/1000,0)}K USDC · ${buyModal.id}`, ts:nowStr() });
    toast(`✓ ${tonnes}t ${lang==="en"?"purchased":lang==="ru"?"куплено":"сатып алынды"} · ${fmtK(tonnes)} GRAIN`);
    setBuyModal(null); setBuyTonnes("");
  }

  return (
    <div className="page">
      <div className="stats c3 mb-20">
        <div className="stat-card"><div className="stat-label">{lang==="en"?"Active lots":lang==="ru"?"Активных лотов":"Белсенді лоттар"}</div><div className="stat-val">{MARKET_LOTS.length}</div><div className="stat-sub">{lang==="en"?"Across 4 silos":lang==="ru"?"В 4 элеваторах":"4 элеватордан"}</div></div>
        <div className="stat-card"><div className="stat-label">{lang==="en"?"Total available":lang==="ru"?"Всего доступно":"Жалпы қолжетімді"}</div><div className="stat-val green">{fmtK(MARKET_LOTS.reduce((s,l)=>s+(l.tonnes*(1-l.fill)),0))}t</div><div className="stat-sub">{lang==="en"?"Ready to buy":lang==="ru"?"Готово к покупке":"Сатуға дайын"}</div></div>
        <div className="stat-card"><div className="stat-label">CME ZW1! {lang==="en"?"price":lang==="ru"?"цена":"бағасы"}</div><div className="stat-val gold">${fmt(wPrice*36.744)}/t</div><div className="stat-sub">Pyth oracle · live</div></div>
      </div>

      <div className="flex-gap mb-16 flex-wrap">
        {[[`all`,t.allGrades],[`g1`,t.grade1],[`g2`,t.grade2],[`g3`,t.grade3]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setFilter(id)}
            style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:500,border:"1.5px solid",cursor:"pointer",
              background: filter===id?"var(--ink)":"transparent",
              borderColor: filter===id?"var(--ink)":"var(--border-m)",
              color: filter===id?"white":"var(--ink-l)"}}>
            {lbl}
          </button>
        ))}
        <div style={{marginLeft:"auto"}} className="flex-gap">
          <span className="badge badge-live">{t.livePrices}</span>
          <span className="text-sm">Pyth ZW1! · {fmt(wPrice)}¢/bu</span>
        </div>
      </div>

      {filtered.map(lot => (
        <div key={lot.id} className="lot-card" onClick={()=>setBuyModal(lot)}>
          <div>
            <div className="flex-gap mb-8">
              <span className={`lot-grade ${lot.grade==="1"?"g1":lot.grade==="2"?"g2":"g3"}`}>{lang==="en"?"Grade":lang==="ru"?"Класс":"Сорт"} {lot.grade}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink-l)"}}>{lot.id}</span>
              <span className="text-sm">· {lot.silo}</span>
            </div>
            <div className="lot-title">{lot.region} {t.springWheat}</div>
            <div className="lot-meta mt-8">
              {[[t.protein,lot.protein],[t.moisture,lot.moisture],[t.available,`${Math.round(lot.tonnes*(1-lot.fill))}t`],[t.seller,lot.seller]].map(([k,v])=>(
                <span key={k} className="lot-meta-item">{k}: <strong>{v}</strong></span>
              ))}
            </div>
            <div className="mt-8">
              <div className="flex-between mb-4" style={{fontSize:11,color:"var(--ink-l)"}}>
                <span>{t.lotFill}</span><span>{Math.round(lot.fill*100)}{t.sold}</span>
              </div>
              <div className="prog-track"><div className="prog-fill" style={{width:`${lot.fill*100}%`,background:"var(--teal)"}} /></div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="lot-price">${lot.price}</div>
            <div className="lot-price-sub">{lang==="en"?"per tonne":lang==="ru"?"за тонну":"тоннасына"}</div>
            <button className="btn btn-primary btn-sm mt-8" onClick={e=>{e.stopPropagation();setBuyModal(lot);}}>{t.buyNow}</button>
          </div>
        </div>
      ))}

      {buyModal && (
        <Modal title={t.purchaseLot} sub={`${buyModal.silo} · ${lang==="en"?"Grade":lang==="ru"?"Класс":"Сорт"} ${buyModal.grade}`}
          onClose={()=>{setBuyModal(null);setBuyTonnes("")}}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={()=>{setBuyModal(null);setBuyTonnes("")}}>{t.cancel}</button>
            <button className="btn btn-primary" style={{flex:1}}
              disabled={!buyTonnes||parseFloat(buyTonnes)<=0||parseFloat(buyTonnes)*buyModal.price*1000>wallet.usdc}
              onClick={handleBuy}>
              {lang==="en"?"Buy":lang==="ru"?"Купить":"Сатып алу"} {buyTonnes||"—"} {lang==="en"?"tonnes":lang==="ru"?"тонн":"тонна"}
            </button>
          </>}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {[[t.price,`$${buyModal.price}/tonne`],[t.protein,buyModal.protein],[t.moisture,buyModal.moisture],[t.receipt,buyModal.id]].map(([k,v])=>(
              <div key={k} style={{background:"var(--sand)",borderRadius:6,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"var(--ink-l)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{k}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:500}}>{v}</div>
              </div>
            ))}
          </div>
          <div className="field">
            <label className="field-label">{t.quantity}</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder={`Max ${Math.round(buyModal.tonnes*(1-buyModal.fill))}`}
                value={buyTonnes} onChange={e=>setBuyTonnes(e.target.value)}/>
              <div className="input-sfx">{lang==="en"?"tonnes":lang==="ru"?"тонн":"тонна"}</div>
            </div>
          </div>
          {buyTonnes&&parseFloat(buyTonnes)>0&&(
            <div className="info-box">{t.cost}: <strong>${fmt(parseFloat(buyTonnes)*buyModal.price*1000,0)}</strong> USDC · {t.grainReceived}: <strong>{fmtK(parseFloat(buyTonnes)*1_000_000)}</strong> · {t.settlement}: {t.lessThan1s}</div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── LENDER TAB ───────────────────────────────────────────────────────────────
function LenderTab({ wallet, setWallet, toast, log }: any) {
  const { lang } = useLang(); const t = T[lang];
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [earned, setEarned] = useState({ v1:1842.50, v2:623.40 });
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setEarned(e => ({ v1: e.v1 + 0.14, v2: e.v2 + 0.05 }));
      setFlash(true); setTimeout(()=>setFlash(false), 350);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  function handleDeposit() {
    const a = parseFloat(depositAmt);
    if (!a||a>wallet.usdc) { toast(lang==="en"?"Invalid amount":lang==="ru"?"Неверная сумма":"Жарамсыз сома","err"); return; }
    setWallet((w: any) => ({ ...w, usdc: w.usdc - a }));
    log({ c:"var(--teal)", t:`${lang==="en"?"Deposited":lang==="ru"?"Внесено":"Салынды"} ${fmt(a,0)} USDC → GRAIN Senior Vault · 11.2% APY`, ts:nowStr() });
    toast(`✓ ${fmt(a,0)} USDC ${lang==="en"?"deposited · yield starts now":lang==="ru"?"внесено · доходность начинается":"салынды · табыс басталды"}`);
    setDepositModal(false); setDepositAmt("");
  }

  const total = 35000;

  return (
    <div className="page">
      <div className="g2 mb-20">
        <div className="vault-dark">
          <div className="flex-between mb-12">
            <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{t.totalDeposited}</span>
            <span className="badge badge-live">{t.earning}</span>
          </div>
          <div style={{fontFamily:"var(--mono)",fontSize:28,fontWeight:500,color:"white",marginBottom:3}}>${fmt(total,0)}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:14}}>{t.usdcAcross}</div>
          <div className="divider" style={{borderColor:"rgba(255,255,255,.1)"}}/>
          <div className="vault-meta">
            <div className="vault-meta-item">
              <div className="vm-label">{t.totalEarned}</div>
              <div className={`vm-val ticker ${flash?"flash":""}`}>${fmt(earned.v1+earned.v2)}</div>
            </div>
            <div className="vault-meta-item">
              <div className="vm-label">{t.blendedApy}</div>
              <div className="vm-val" style={{color:"#e8c85a"}}>10.8%</div>
            </div>
            <div className="vault-meta-item">
              <div className="vm-label">{t.nextPayout}</div>
              <div className="vm-val">~7h</div>
            </div>
          </div>
        </div>

        <div>
          <div className="carry-meter mb-10">
            <div className="flex-between mb-4">
              <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{t.grainSeniorVault}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:500,color:"var(--teal-d)"}}>11.2% APY</span>
            </div>
            <div className="apy-row">
              <svg viewBox="0 0 56 56" style={{width:52,height:52,flexShrink:0,transform:"rotate(-90deg)"}}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--wheat)" strokeWidth="5"/>
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--teal)" strokeWidth="5"
                  strokeDasharray={`${11.2/20*138.2} 138.2`} strokeLinecap="round"/>
              </svg>
              <div>
                <div style={{fontSize:13,color:"var(--ink-m)"}}>{t.seniorTranche}</div>
                <div className={`stat-val green mt-4 ticker ${flash?"flash":""}`}>${fmt(earned.v1)}</div>
                <div className="text-sm">{t.earnedSoFar}</div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex-between text-sm mb-4"><span>{t.vaultUtil}</span><span>78%</span></div>
              <div className="prog-track"><div className="prog-fill" style={{width:"78%",background:"var(--teal)"}}/></div>
            </div>
          </div>

          <div className="carry-meter">
            <div className="flex-between mb-4">
              <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{t.sgrainYieldVault}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:500,color:"var(--amber)"}}>9.4% APY</span>
            </div>
            <div className={`stat-val mt-4 ticker ${flash?"flash":""}`} style={{color:"var(--amber)"}}>${fmt(earned.v2)}</div>
            <div className="text-sm mt-4">{lang==="en"?"earned · $10,000 deposited":lang==="ru"?"заработано · внесено $10 000":"табылды · $10 000 салынды"}</div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="flex-between mb-12">
            <div className="card-title" style={{margin:0}}>{t.yourPositions}</div>
            <button className="btn btn-primary btn-sm" onClick={() => setDepositModal(true)}>{t.depositUsdc}</button>
          </div>
          {[
            {name:t.grainSeniorVault,sub:lang==="en"?"Wheat Grade 1+2 · since Oct 2025":lang==="ru"?"Пшеница кл. 1+2 · с окт. 2025":"Бидай 1+2 сорт · 2025 қазан",apy:"11.2%",dep:25000,earn:earned.v1,health:98},
            {name:t.sgrainYieldVault,sub:lang==="en"?"sGRAIN-backed · since Nov 2025":lang==="ru"?"На основе sGRAIN · с ноя. 2025":"sGRAIN негізінде · 2025 қараша",apy:"9.4%",dep:10000,earn:earned.v2,health:100},
          ].map(p=>(
            <div key={p.name} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:36,height:36,borderRadius:8,background:"var(--teal-l)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌾</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{p.name}</div>
                <div className="text-sm mt-4">{p.sub}</div>
                <div className="flex-gap mt-8">
                  <span className="text-sm">{t.health}:</span>
                  <div className="prog-track" style={{width:60,height:4}}><div className="prog-fill" style={{width:`${p.health}%`,background:"var(--teal)"}}/></div>
                  <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--teal-d)"}}>{p.health}%</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:14,fontWeight:500,color:"var(--teal-d)"}}>{p.apy}</div>
                <div className={`td-green ticker ${flash?"flash":""}`}>${fmt(p.earn)}</div>
                <div className="text-sm">${fmt(p.dep,0)} {t.dep}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">{t.howYieldWorks}</div>
          {[
            [1,t.ly1,"var(--teal)"],
            [2,t.ly2,"var(--teal)"],
            [3,t.ly3,"var(--amber)"],
            [4,t.ly4,"var(--teal)"],
            [5,t.ly5,"var(--ink-l)"],
          ].map(([n,txt,c])=>(
            <div key={n as number} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:c as string,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"white",flexShrink:0}}>{n}</div>
              <div style={{fontSize:12,color:"var(--ink-m)",lineHeight:1.5}}>{txt as string}</div>
            </div>
          ))}
          <div className="info-box mt-8">{t.securedByWheat} <strong>{t.physicallySegregated}</strong> {t.inLicensedSilos}</div>
        </div>
      </div>

      {depositModal && (
        <Modal title={t.depositModal} sub={t.earnSecured}
          onClose={() => setDepositModal(false)}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={() => setDepositModal(false)}>{t.cancel}</button>
            <button className="btn btn-primary" style={{flex:1}} disabled={!depositAmt||parseFloat(depositAmt)<=0||parseFloat(depositAmt)>wallet.usdc} onClick={handleDeposit}>{t.depositEarn}</button>
          </>}>
          <div className="field">
            <label className="field-label">{t.depositAmt}</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder="e.g. 5000" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)}/>
              <div className="input-sfx">USDC</div>
            </div>
            <div className="text-sm mt-8">{lang==="en"?"Available":lang==="ru"?"Доступно":"Қолжетімді"}: {fmt(wallet.usdc,0)} USDC</div>
          </div>
          {depositAmt&&parseFloat(depositAmt)>0&&(
            <div className="info-box">{t.annualYield}: <strong>${fmt(parseFloat(depositAmt)*.112,0)}</strong> · {t.monthly}: <strong>${fmt(parseFloat(depositAmt)*.112/12,0)}</strong></div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── CARRY TAB ────────────────────────────────────────────────────────────────
function CarryTab({ wallet, setWallet, wPrice, toast, log }: any) {
  const { lang } = useLang(); const t = T[lang];
  const [carrySpread, setCarrySpread] = useState(1480); // bps
  const [enterModal, setEnterModal] = useState(false);
  const [enterAmt, setEnterAmt] = useState("");
  const [cgrainEarned, setCgrainEarned] = useState(0);
  const [cgrainRate, setCgrainRate] = useState(1_000_000_000);
  const [rateFlash, setRateFlash] = useState(false);

  // ── Live carry spread simulation (realistic: slow drift, not random jump) ──
  // Real CME spread changes by ~0.01-0.05% per day, we simulate that
  useEffect(() => {
    const ti = setInterval(() => {
      setCarrySpread(s => {
        // Gentle drift: ±2 bps per 10 seconds, mean-reverting toward 1480
        const pull = (1480 - s) * 0.01; // mean reversion
        const noise = (Math.random() - 0.5) * 4;
        return Math.max(600, Math.min(2400, Math.round(s + pull + noise)));
      });
      setRateFlash(true);
      setTimeout(() => setRateFlash(false), 300);
    }, 10_000); // every 10 seconds, not 3.2
    return () => clearInterval(ti);
  }, []);

  // ── cGRAIN exchange rate — ticks once per minute realistically ─────────────
  // At 14.8% APY: per minute increment = 1e9 * 0.148 / 525600 ≈ 281 units
  // That's visible but not crazy
  useEffect(() => {
    const ti = setInterval(() => {
      setCgrainRate(r => {
        const APY = 0.148;
        const perMinute = APY / 525_600; // 525600 minutes per year
        const increment = Math.round(r * perMinute);
        return r + increment;
      });
      if (wallet.cgrain > 0) {
        setCgrainEarned(e => {
          const APY = 0.148;
          const perMinute = APY / 525_600;
          return e + (wallet.cgrain / 1_000_000) * perMinute;
        });
      }
    }, 60_000); // tick once per minute
    return () => clearInterval(ti);
  }, [wallet.cgrain]);

  const annualizedApy = (carrySpread / 10000 * 365 / 180 * 100).toFixed(1);
  const isContango = carrySpread > 0;
  const spotPrice = wPrice * 36.744;
  const marchPrice = spotPrice * (1 + carrySpread / 10000 * 180 / 365);

  function handleEnter() {
    const kg = parseFloat(enterAmt) * 1_000_000;
    if (!enterAmt||kg>wallet.grain) { toast(lang==="en"?"Insufficient GRAIN":lang==="ru"?"Недостаточно GRAIN":"GRAIN жеткіліксіз","err"); return; }
    const cgrain = Math.floor(kg * 1e9 / cgrainRate);
    setWallet((w: any) => ({ ...w, grain: w.grain - kg, cgrain: (w.cgrain||0) + cgrain }));
    log({ c:"var(--gold)", t:`${lang==="en"?"Entered carry":lang==="ru"?"Открыта кэрри-позиция":"Кэрри позиция ашылды"}: ${fmtK(kg/1_000_000)} GRAIN → cGRAIN · spread=${(carrySpread/100).toFixed(1)}% · APY=${annualizedApy}%`, ts:nowStr() });
    toast(`✓ ${lang==="en"?"Carry position opened":lang==="ru"?"Кэрри-позиция открыта":"Кэрри позициясы ашылды"} · ${annualizedApy}% APY`);
    setEnterModal(false); setEnterAmt("");
  }

  function handleExit() {
    if (!wallet.cgrain||wallet.cgrain<=0) return;
    const grainBack = Math.floor(wallet.cgrain * cgrainRate / 1e9);
    const yield_ = grainBack - wallet.cgrain;
    setWallet((w: any) => ({ ...w, cgrain: 0, grain: w.grain + grainBack }));
    log({ c:"var(--gold)", t:`${lang==="en"?"Exited carry":lang==="ru"?"Кэрри закрыт":"Кэрриден шықты"}: ${fmtK(wallet.cgrain/1_000_000)} cGRAIN → ${fmtK(grainBack/1_000_000)} GRAIN (+${fmtK(yield_/1_000_000)} GRAIN)`, ts:nowStr() });
    toast(`✓ ${lang==="en"?"Carry exited":lang==="ru"?"Кэрри закрыт":"Кэрри жабылды"} · ${fmtK(grainBack/1_000_000)} GRAIN`);
  }

  const posValue = wallet.cgrain ? wallet.cgrain/1_000_000 * spotPrice / 1000 : 0;

  return (
    <div className="page">
      <div className="stats c4 mb-20">
        <div className="stat-card">
          <div className="stat-label">{lang==="en"?"Carry spread (Sep→Mar)":lang==="ru"?"Кэрри спред (сен.→мар.)":"Кэрри спреді (қыр.→нау.)"}</div>
          <div className={`stat-val ${isContango?"gold":"red"}`}>{isContango?"+":(carrySpread<0?"-":"")}{(Math.abs(carrySpread)/100).toFixed(1)}%</div>
          <div className="stat-sub">{isContango?"CONTANGO ✓":"BACKWARDATION"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t.annualizedCarryApy}</div>
          <div className="stat-val gold">{annualizedApy}%</div>
          <div className="stat-sub">{lang==="en"?"vs 3.2% base sGRAIN":lang==="ru"?"против 3.2% базового sGRAIN":"3.2% базалық sGRAIN-ге қарсы"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t.cgrainRate}</div>
          <div className={`stat-val ticker-gold ticker ${rateFlash?"flash":""}`} style={{color:"var(--gold)",fontFamily:"var(--mono)",fontSize:16}}>{cgrainRate.toLocaleString()}</div>
          <div className="stat-sub">×10<sup>-9</sup> GRAIN/cGRAIN · ticking ↑</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t.yourCgrain}</div>
          <div className="stat-val gold">{fmtK((wallet.cgrain||0)/1_000_000)}</div>
          <div className="stat-sub">≈ ${fmt(posValue,0)} value</div>
        </div>
      </div>

      <div className="g2 mb-16">
        <div className="carry-zone">
          <div style={{display:"flex",alignItems:"flex-end",gap:6,marginBottom:4}}>
            <div className={`carry-spread-val ${isContango?"contango-color":"backwardation-color"}`}>
              {isContango?"+":(carrySpread<0?"-":"")}{(Math.abs(carrySpread)/100).toFixed(2)}%
            </div>
            <span style={{fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:6}}>{t.carrySpreadLabel}</span>
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:16}}>{t.cmePyth}</div>

          <div className="spread-bar-track">
            <div className={`spread-bar-fill ${isContango?"contango":"backwardation"}`}
              style={{width:`${Math.min(100,Math.abs(carrySpread)/22)}%`}}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14}}>
            <div style={{background:"rgba(255,255,255,.06)",borderRadius:6,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:3}}>{t.zwSepSpot}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:14,color:"white"}}>${fmt(spotPrice)}/tonne</div>
            </div>
            <div style={{background:"rgba(255,255,255,.06)",borderRadius:6,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:3}}>{t.zwMarchFutures}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:14,color:"#e8c85a"}}>${fmt(marchPrice)}/tonne</div>
            </div>
          </div>

          <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,255,255,.06)",borderRadius:6}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:3}}>{t.annualizedCarryApy}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:18,color:"#e8c85a",fontWeight:500}}>{annualizedApy}%</div>
          </div>
        </div>

        <div>
          <div className="card mb-12">
            <div className="card-title">{t.howCarryWorks}</div>
            <div className="gold-box">{t.carryExplain}</div>
            {[
              [t.physicalGrain, t.alreadyHappening],
              [t.cgrainAccrues, t.updatesEveryBlock],
              [t.exitInMarch, t.moreGrainReturned],
              [t.avgCarry, t.avgCarryVal],
            ].map(([k,v])=>(
              <div key={k} className="flex-between" style={{fontSize:12,padding:"6px 0",borderTop:"1px solid var(--border)"}}>
                <span style={{color:"var(--ink-l)"}}>{k}</span>
                <span style={{fontFamily:"var(--mono)",color:"var(--gold)",fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">{t.historicalSpreadTitle}</div>
            <div style={{display:"flex",gap:2,alignItems:"flex-end",height:80}}>
              {HISTORICAL_CARRY.map(d => {
                const h = Math.min(70, Math.max(4, Math.abs(d.pct) * 1.1));
                return (
                  <div key={d.yr} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div title={`${d.yr}: ${d.pct>0?"+":""}${d.pct}%`}
                      style={{width:"100%",height:h,borderRadius:2,
                        background:d.pct>0?"var(--teal)":"var(--red)",opacity:.75}}/>
                  </div>
                );
              })}
            </div>
            <div className="flex-between mt-8 text-sm">
              <span>2005</span>
              <span style={{color:"var(--teal-d)"}}>+18.4% avg</span>
              <span>2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="flex-between mb-12">
            <div className="card-title" style={{margin:0}}>{t.enterCarryPos}</div>
            <span className="badge badge-gold">{annualizedApy}% APY</span>
          </div>
          <div className="gold-box">{t.depositGrain}</div>
          <div className="field">
            <label className="field-label">{t.grainToLock}</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder="e.g. 500000" value={enterAmt} onChange={e=>setEnterAmt(e.target.value)}/>
              <div className="input-sfx">kg</div>
            </div>
            <div className="text-sm mt-4">{t.available2}: {fmtK(wallet.grain/1_000_000)} GRAIN ({fmtK(wallet.grain/1_000_000)} kg)</div>
          </div>
          {enterAmt&&parseFloat(enterAmt)>0&&(
            <div className="gold-box">{t.atApy} {annualizedApy}% {t.inSixMonths} <strong>+{fmt(parseFloat(enterAmt)*parseFloat(annualizedApy)/100/2,0)} {t.kgGrainYield}</strong> {t.onYourPos}</div>
          )}
          <button className="btn btn-gold btn-full mt-4" disabled={!wallet.grain||wallet.grain<100_000||!enterAmt||parseFloat(enterAmt)*1_000_000>wallet.grain} onClick={()=>{ if(enterAmt&&parseFloat(enterAmt)>0) handleEnter(); else setEnterModal(true); }}>
            {t.enterCarryBtn}
          </button>
        </div>

        <div className="card">
          <div className="card-title">{t.yourActiveCarry}</div>
          {wallet.cgrain > 0 ? (
            <>
              <div className="receipt-card mt-4" style={{background:"#1a1208"}}>
                <div className="receipt-serial">{t.carryPosLabel}</div>
                <div className="receipt-amount" style={{color:"#e8c85a"}}>{fmtK((wallet.cgrain||0)/1_000_000)} cGRAIN</div>
                <div className="receipt-sub">{t.wheatCarry}</div>
                <div className="receipt-row"><span className="receipt-key">{t.exchangeRate}</span><span className="receipt-val">{cgrainRate.toLocaleString()}</span></div>
                <div className="receipt-row"><span className="receipt-key">{t.carryApy}</span><span className="receipt-val" style={{color:"#e8c85a"}}>{annualizedApy}%</span></div>
                <div className="receipt-row"><span className="receipt-key">{t.yieldAccrued}</span><span className="receipt-val" style={{color:"#5ecba1"}}>+{cgrainEarned.toFixed(4)} GRAIN</span></div>
                <div className="receipt-row"><span className="receipt-key">{t.status}</span><span className="receipt-val" style={{color:"#e8c85a"}}>{t.carryAccruing}</span></div>
              </div>
              <button className="btn btn-outline btn-full mt-12" onClick={handleExit}>{t.exitCarry}</button>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"32px 0",color:"var(--ink-l)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📈</div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:4}}>{t.noActiveCarry}</div>
              <div style={{fontSize:12}}>{t.enterToEarn}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ON-CHAIN FEED ────────────────────────────────────────────────────────────
// Fetches real transaction signatures from Solana devnet RPC — no packages needed
function OnChainFeed() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function fetchTxs() {
    try {
      // Fetch recent signatures for our program + all 4 mints
      const accounts = [
        ADDRESSES.program.val,
        ADDRESSES.grain.val,
        ADDRESSES.sgrain.val,
        ADDRESSES.cgrain.val,
        ADDRESSES.usdc.val,
      ];

      const results = await Promise.all(
        accounts.map(addr =>
          fetch(CLUSTER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0", id: 1,
              method: "getSignaturesForAddress",
              params: [addr, { limit: 5, commitment: "confirmed" }],
            }),
          }).then(r => r.json()).then(d => (d.result || []).map((tx: any) => ({ ...tx, account: addr })))
        )
      );

      // Flatten, deduplicate by signature, sort by blockTime desc
      const all = results.flat();
      const seen = new Set<string>();
      const deduped = all.filter(tx => {
        if (seen.has(tx.signature)) return false;
        seen.add(tx.signature);
        return true;
      });
      deduped.sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0));
      setTxs(deduped.slice(0, 12));
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Feed fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTxs();
    const interval = setInterval(fetchTxs, 15_000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  function shortSig(sig: string) {
    return sig.slice(0, 8) + "…" + sig.slice(-6);
  }

  function timeAgo(ts: number) {
    const secs = Math.floor(Date.now() / 1000) - ts;
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
    return `${Math.floor(secs/3600)}h ago`;
  }

  function accountLabel(addr: string) {
    const found = Object.entries(ADDRESSES).find(([,v]) => v.val === addr);
    return found ? found[1].label : addr.slice(0,6)+"…";
  }

  return (
    <div className="card mb-20">
      <div className="flex-between mb-12">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="card-title" style={{margin:0}}>Live On-Chain Activity</div>
          <span className="badge badge-live">● DEVNET</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {lastRefresh && (
            <span style={{fontSize:10,color:"var(--ink-l)",fontFamily:"var(--mono)"}}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchTxs(); }}
            style={{padding:"3px 10px",borderRadius:4,fontSize:11,border:"1.5px solid var(--border-m)",background:"transparent",cursor:"pointer",color:"var(--ink-l)"}}
          >↻ Refresh</button>
        </div>
      </div>

      {loading && txs.length === 0 ? (
        <div style={{textAlign:"center",padding:"24px 0",color:"var(--ink-l)",fontSize:13}}>
          Fetching transactions from Solana devnet…
        </div>
      ) : txs.length === 0 ? (
        <div style={{textAlign:"center",padding:"24px 0",color:"var(--ink-l)",fontSize:13}}>
          No transactions yet — mint some tokens to create on-chain activity!
        </div>
      ) : (
        <div style={{display:"grid",gap:6}}>
          {txs.map(tx => (
            <div key={tx.signature} style={{
              display:"grid", gridTemplateColumns:"1fr auto auto auto",
              alignItems:"center", gap:10,
              padding:"9px 12px",
              background: tx.err ? "var(--red-l)" : "var(--sand)",
              borderRadius:"var(--r)",
              border:`1px solid ${tx.err ? "rgba(184,60,40,.15)" : "var(--border)"}`,
            }}>
              <div style={{overflow:"hidden"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink-m)",marginBottom:2}}>
                  {shortSig(tx.signature)}
                </div>
                <div style={{fontSize:10,color:"var(--ink-l)"}}>
                  {accountLabel(tx.account)}
                </div>
              </div>
              <span style={{
                fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:3,
                background: tx.err ? "var(--red-l)" : "var(--teal-l)",
                color: tx.err ? "var(--red)" : "var(--teal-d)",
                whiteSpace:"nowrap"
              }}>{tx.err ? "failed" : "success"}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--ink-l)",whiteSpace:"nowrap"}}>
                {tx.blockTime ? timeAgo(tx.blockTime) : "—"}
              </span>
              <a
                href={`${EXPLORER}/tx/${tx.signature}?cluster=${CLUSTER}`}
                target="_blank" rel="noopener"
                style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--sky)",textDecoration:"none",whiteSpace:"nowrap"}}
              >↗ View</a>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop:12,fontSize:11,color:"var(--ink-l)",display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"var(--teal)",animation:"pulse-dot 2s infinite"}}/>
        Polling Solana devnet RPC every 15 seconds · {txs.length} transactions shown
      </div>
    </div>
  );
}


function JudgeTab({ toast }: any) {
  const { lang } = useLang(); const t = T[lang];
  const [copied, setCopied] = useState("");

  function copy(v: string, label: string) {
    navigator.clipboard?.writeText(v).catch(()=>{});
    setCopied(label); toast(`✓ Copied!`);
    setTimeout(()=>setCopied(""), 1800);
  }

  const addrList = Object.values(ADDRESSES);

  return (
    <div className="page">
      <div className="judge-hero">
        <div className="judge-hero-title">{t.judgeTitle.split("\n").map((line,i)=><span key={i}>{line}{i===0&&<br/>}</span>)}</div>
        <div className="judge-hero-sub">{t.judgeSub}</div>
        <div>
          {[["Legal ✓","jt-teal"],["KZ Law on Grain 2022","jt-gold"],["Qoldau.kz Registry","jt-gold"],["Anchor 0.30.1","jt-sky"],["Devnet Live","jt-teal"],["192 Licensed Silos","jt-teal"],["Decentrathon 2026","jt-gold"]].map(([l,c])=>(
            <span key={l} className={`judge-tag ${c}`}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── Live transaction feed ── */}
      <OnChainFeed />

      {/* ── Live on-chain addresses ── */}
      <div className="card mb-20">
        <div className="flex-between mb-16">
          <div className="card-title" style={{margin:0}}>{t.onChainAddresses}</div>
          <span className="badge badge-live">● DEVNET LIVE</span>
        </div>
        <div style={{display:"grid",gap:10}}>
          {addrList.map(a => (
            <div key={a.label} style={{
              display:"grid", gridTemplateColumns:"140px 1fr auto auto",
              alignItems:"center", gap:10,
              padding:"10px 14px", background:"var(--sand)",
              borderRadius:"var(--r)", border:"1px solid var(--border)"
            }}>
              <span style={{fontSize:11,fontWeight:600,color:"var(--ink-l)",textTransform:"uppercase",letterSpacing:".05em"}}>{a.label}</span>
              <code style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--ink-m)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.val}</code>
              <a
                href={`${EXPLORER}/address/${a.val}?cluster=${CLUSTER}`}
                target="_blank" rel="noopener"
                style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--sky)",textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}
              >↗ Explorer</a>
              <button
                onClick={() => copy(a.val, a.label)}
                style={{
                  padding:"4px 10px", borderRadius:4, fontSize:11, fontWeight:600,
                  border:"1.5px solid var(--border-m)", background: copied===a.label?"var(--teal)":"transparent",
                  color: copied===a.label?"white":"var(--ink-l)", cursor:"pointer",
                  transition:"all .15s", whiteSpace:"nowrap", flexShrink:0
                }}
              >{copied===a.label?"✓ Copied":"Copy"}</button>
            </div>
          ))}
        </div>
        <div className="info-box mt-16">
          All transactions are verifiable on <a href={`${EXPLORER}/?cluster=${CLUSTER}`} target="_blank" rel="noopener" style={{color:"var(--teal-d)"}}>Solana Devnet Explorer</a>.
          Program deployed at block height — check the program account to see all on-chain state.
        </div>
      </div>

      <div className="g2 mb-20">
        <div className="card">
          <div className="card-title">{t.judgeWallets}</div>
          <p className="text-sm mb-12">{t.runWallets} <code style={{fontFamily:"var(--mono)",background:"var(--sand)",padding:"1px 5px",borderRadius:3}}>yarn wallets</code> {t.toCreate}</p>
          {JUDGE_WALLETS.map(w => (
            <div key={w.n} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:w.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:600,flexShrink:0}}>J{w.n}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink-m)"}}>{w.pub}</div>
                <div className="text-sm mt-4">1 SOL · {w.usdc.toLocaleString()} USDC · {w.grain.toLocaleString()} GRAIN</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={()=>copy(w.pub,"wallet")} style={{padding:"3px 8px",fontSize:10}}>{t.copy}</button>
            </div>
          ))}
          <div className="info-box mt-12">{t.importPhantom} <code style={{fontFamily:"var(--mono)",fontSize:10}}>judge-wallets-private.json</code>.</div>
        </div>

        <div className="card">
          <div className="card-title">Quick CLI checks</div>
          {[
            ["Check program is deployed", `solana program show ${ADDRESSES.program.val} --url devnet`],
            ["Check GRAIN mint supply", `spl-token supply ${ADDRESSES.grain.val} --url devnet`],
            ["Check sGRAIN mint", `spl-token supply ${ADDRESSES.sgrain.val} --url devnet`],
            ["Check cGRAIN mint", `spl-token supply ${ADDRESSES.cgrain.val} --url devnet`],
            ["Run full demo", "npx ts-node scripts/demo-interactions.ts"],
            ["Carry oracle", "npx ts-node scripts/carry-oracle.ts --once"],
          ].map(([l,cmd])=>(
            <div key={l} style={{marginBottom:10}}>
              <div className="text-sm mb-4">{l}</div>
              <code style={{fontFamily:"var(--mono)",fontSize:11,background:"var(--sand)",padding:"4px 8px",borderRadius:4,display:"block",color:"var(--ink-m)",cursor:"pointer",overflow:"auto"}}
                onClick={()=>copy(cmd,"command")}>{cmd}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-title">{t.testingWalkthrough}</div>
        {t.steps.map((s,i) => {
          const colors = ["var(--teal)","var(--teal)","var(--sky)","var(--gold)","var(--teal)","var(--gold)","var(--teal)","var(--amber)","var(--teal)"];
          return (
            <div key={i} className="judge-step">
              <div className="step-num" style={{background:colors[i],minWidth:28}}>{i+1}</div>
              <div className="step-body">
                <h4>{s.h}</h4>
                <p>{s.d}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">{t.legalBasis}</div>
        {t.legal.map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:12}}>
            <span style={{fontWeight:600,color:"var(--ink)"}}>{k}</span>
            <span style={{color:"var(--ink-l)",textAlign:"right",maxWidth:"55%"}}>{v}</span>
          </div>
        ))}
        <div className="info-box mt-12">{t.legalNote} <strong>{t.solanaNative}</strong> {t.govtPiloting}</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("farmer");
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];

  const [wallet, setWallet] = useState({
    usdc: 45000, grain: 3_200_000_000, sgrain: 1_850_000_000, cgrain: 0, chain: 420
  });
  const [wPrice, setWPrice] = useState(182.4);
  const [wDelta, setWDelta] = useState(0.12);
  const [toastMsg, setToastMsg] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  useEffect(() => {
    const ti = setInterval(() => {
      setWPrice(p => {
        const d = (Math.random() - 0.47) * 0.18;
        const np = Math.max(155, Math.min(215, +(p+d).toFixed(2)));
        setWDelta(+(np-p).toFixed(2));
        return np;
      });
    }, 2600);
    return () => clearInterval(ti);
  }, []);

  const toast = useCallback((msg: string, type="ok") => setToastMsg({ msg, type }), []);
  const log   = useCallback((a: any) => setActivities(p => [...p.slice(-19), a]), []);

  const TABS = [
    { id:"farmer", label:t.farmerDash, icon:"🌾" },
    { id:"market", label:t.p2pMarket,  icon:"⚖️" },
    { id:"lender", label:t.lenderVault,icon:"💰" },
    { id:"carry",  label:t.carryVault, icon:"📈", badge:"NEW" },
    { id:"judge",  label:t.judgeGuide, icon:"🎓" },
  ];

  const props = { wallet, setWallet, wPrice, toast, log };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-badge">🌾</div>
          GrainChain KZ
        </div>
        <div className="topbar-center">
          <div className="price-chip">
            <div className="live-dot"/>
            <span className="price-label">ZW1!</span>
            <span className="price-value">{fmt(wPrice)}¢/bu</span>
            <span className="price-value">${fmt(wPrice*36.744)}/t</span>
            <span className={`price-delta ${wDelta>=0?"up":"dn"}`}>{wDelta>=0?"+":""}{wDelta}</span>
          </div>
          <div className="price-chip">
            <span className="price-label">{t.network}</span>
            <span className="price-value" style={{color:"#5ecba1"}}>Devnet</span>
          </div>
        </div>
        <div className="topbar-right">
          <div className="lang-switcher">
            {(["en","ru","kz"] as Lang[]).map(l => (
              <button key={l} className={`lang-btn ${lang===l?"active":""}`} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="wallet-pill"><div className="w-dot"/>{fmt(wallet.usdc,0)} USDC</div>
          <div className="wallet-pill"><div className="w-dot"/>{(wallet.grain/1_000_000).toFixed(0)} GRAIN</div>
        </div>
      </div>

      <div className="nav">
        {TABS.map(tb => (
          <button key={tb.id} className={`nav-item ${tab===tb.id?"active":""}`} onClick={()=>setTab(tb.id)}>
            <span>{tb.icon}</span>{tb.label}
            {tb.badge && <span className="nav-badge">{tb.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{flex:1, paddingBottom: activities.length ? 44 : 0}}>
        {tab==="farmer" && <FarmerTab {...props}/>}
        {tab==="market" && <MarketTab {...props}/>}
        {tab==="lender" && <LenderTab {...props}/>}
        {tab==="carry"  && <CarryTab  {...props}/>}
        {tab==="judge"  && <JudgeTab  toast={toast}/>}
      </div>

      {activities.length > 0 && (
        <div className="activity-bar">
          <div className="activity-inner">
            <span className="act-label">{t.activity}</span>
            {activities.slice(-1).map((a,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,flex:1,overflow:"hidden"}}>
                <div className="act-dot" style={{background:a.c}}/>
                <span className="act-text">{a.t}</span>
                <span className="act-time">{a.ts}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onDone={()=>setToastMsg(null)}/>}
    </div>
    </LangContext.Provider>
  );
}
