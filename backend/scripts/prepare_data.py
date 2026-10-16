"""
VERITAS AI - Dataset Preparation Pipeline
Downloads, validates, cleans, deduplicates, and normalizes the news dataset.
"""

import os
import sys
import io
import json
import zipfile
import urllib.request
import pandas as pd
import numpy as np

DATASET_URL_ZIP = "https://raw.githubusercontent.com/joolsa/fake_real_news_dataset/master/fake_or_real_news.csv.zip"
DATASET_URL_CSV = "https://raw.githubusercontent.com/LutzHamel/fake-news/master/data/fake_or_real_news.csv"

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
OUTPUT_CSV = os.path.join(DATA_DIR, "news_dataset.csv")
SAMPLE_ARTICLES_JSON = os.path.join(DATA_DIR, "sample_articles.json")


def download_benchmark_dataset() -> pd.DataFrame:
    """Attempt to download the George McIntire benchmark dataset from known GitHub mirrors."""
    print("Attempting to retrieve benchmark dataset...")
    
    # Try zip first (smaller download, ~11MB)
    try:
        print(f"Trying ZIP mirror: {DATASET_URL_ZIP}")
        req = urllib.request.Request(DATASET_URL_ZIP, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                csv_filename = [f for f in z.namelist() if f.endswith(".csv")][0]
                with z.open(csv_filename) as f:
                    df = pd.read_csv(f)
                    print(f"Successfully downloaded and extracted ZIP ({len(df)} records).")
                    return df
    except Exception as e:
        print(f"ZIP mirror download failed or timed out: {e}")

    # Try raw CSV mirror
    try:
        print(f"Trying raw CSV mirror: {DATASET_URL_CSV}")
        req = urllib.request.Request(DATASET_URL_CSV, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=45) as resp:
            content = resp.read()
            df = pd.read_csv(io.BytesIO(content))
            print(f"Successfully downloaded raw CSV ({len(df)} records).")
            return df
    except Exception as e:
        print(f"Raw CSV mirror download failed: {e}")

    raise RuntimeError("Could not retrieve online benchmark dataset.")


def create_curated_fallback_dataset() -> pd.DataFrame:
    """
    High-quality curated historical dataset of verified real and debunked fake news
    used as reliable offline fallback if remote mirrors are unavailable.
    """
    print("Building curated fallback dataset for offline/isolated execution...")
    records = [
        # REAL: Mainstream investigative, governmental, economic, scientific reporting
        {
            "title": "Federal Reserve Holds Interest Rates Steady Amid Cooling Inflation Data",
            "text": "The Federal Reserve on Wednesday held its benchmark interest rate unchanged in a targeted range of 5.25% to 5.50%, noting that economic activity has been expanding at a solid pace and job gains have remained robust. Federal Reserve Chair Jerome Powell stated during a press briefing that while inflation has eased substantially over the past year, central bank policymakers require greater confidence that inflation is moving sustainably toward the two percent objective before considering monetary policy easing. Consumer price index figures published earlier in the month demonstrated moderation across energy and goods sectors.",
            "label": "REAL"
        },
        {
            "title": "NASA James Webb Space Telescope Detects Carbon Compounds in Habitable-Zone Exoplanet",
            "text": "Astronomers analyzing spectroscopic observations from the James Webb Space Telescope have identified carbon-bearing molecules including methane and carbon dioxide in the atmosphere of K2-18 b, an exoplanet 8.6 times the mass of Earth located 120 light-years away in the constellation Leo. The findings, published in The Astrophysical Journal Letters, suggest K2-18 b may possess a hydrogen-rich atmosphere above a water-covered ocean surface. Lead researcher Nikku Madhusudhan of the University of Cambridge emphasized that while the chemical signatures are consistent with habitable conditions, additional observation cycles are required to confirm environmental stability.",
            "label": "REAL"
        },
        {
            "title": "European Union Reaches Landmark Agreement on Comprehensive Artificial Intelligence Act",
            "text": "Negotiators from the European Parliament and the Council of the European Union finalized provisional rules governing artificial intelligence systems across the 27-nation bloc following three days of intense negotiations in Brussels. The regulation establishes a tiered risk framework that bans manipulative biometric surveillance in public spaces, mandates transparency requirements for high-impact foundation models, and institutes strict compliance assessments for healthcare and infrastructure algorithms. Internal Market Commissioner Thierry Breton declared the agreement a global benchmark for balancing technological innovation with fundamental democratic rights.",
            "label": "REAL"
        },
        {
            "title": "Supreme Court Hears Oral Arguments on Environmental Protection Agency Clean Water Authority",
            "text": "The United States Supreme Court heard oral arguments on Tuesday regarding the statutory scope of the Environmental Protection Agency to regulate adjacent wetlands under the Clean Water Act. The dispute, Sackett v. Environmental Protection Agency, centers on what constitutes 'waters of the United States.' Counsel representing property owners argued that only wetlands maintaining a continuous surface connection with navigable waters fall under federal jurisdiction, whereas the Solicitor General maintained that significant ecological and hydrological nexus dictates regulatory coverage.",
            "label": "REAL"
        },
        {
            "title": "World Health Organization Reports Decline in Global Measles Vaccination Rates Following Disruptions",
            "text": "Global coverage for childhood measles vaccination has slipped to levels not observed in over a decade, leaving approximately 22 million infants unvaccinated against the highly infectious viral disease, according to a joint epidemiological report released by the World Health Organization and UNICEF. Healthcare supply chain disruptions, regional conflicts, and under-resourced public health centers in developing nations contributed significantly to the dip in coverage. Health officials underscored that reaching the 95% community immunity threshold remains critical to preventing cyclical epidemics.",
            "label": "REAL"
        },
        {
            "title": "Treasury Department Issues New Sanctions Targeting Illicit Maritime Oil Networks",
            "text": "The U.S. Department of the Treasury's Office of Foreign Assets Control announced punitive financial measures against maritime shipping firms and associated tanker operators suspected of circumventing the international price cap on crude petroleum. Under the sanctions framework, designated entities face asset freezes and prohibitions against interacting with U.S. financial intermediaries. Deputy Treasury Secretary Wally Adeyemo stated that the enforcement measures seek to constrain revenue streams without precipitating broad volatility in international commodity markets.",
            "label": "REAL"
        },
        {
            "title": "International Energy Agency Projects Global Renewable Capacity Additions to Break Records",
            "text": "Global renewable electricity capacity additions expanded by nearly fifty percent in the past calendar year, marking the fastest growth rate observed in two decades, according to the International Energy Agency's annual market review. Solar photovoltaic installations accounted for three-quarters of new deployment worldwide, driven by lower manufacturing costs and policy incentives across North America, Europe, and Asia. The report concluded that renewable energy is on track to overtake coal as the largest primary source of electricity generation globally within the next three years.",
            "label": "REAL"
        },
        {
            "title": "Global Trade Volumes Slow as Geopolitical Tensions and Higher Financing Costs Weigh on Demand",
            "text": "Merchandise trade growth decelerated in the latest quarter according to data released by the World Trade Organization in Geneva. The barometer showed export orders contracting in major manufacturing hubs across Germany, Japan, and South Korea. Trade economists pointed to elevated central bank interest rates, inventory destocking, and rising transport insurance premiums in key maritime corridors as primary drivers of the subdued trade velocity.",
            "label": "REAL"
        },
        # FAKE: Sensationalist fabrications, conspiracy claims, pseudo-scientific hoaxes
        {
            "title": "Secret Underground Military Base Discovered Beneath Denver Airport Housing Alien Technology",
            "text": "Shocking whistleblower documents leaked on dark web forums have finally proven what truth-seekers suspected for decades: a massive underground subterranean complex beneath the Denver International Airport holds extraterrestrial spacecraft and biometric cloning vats operated by the shadowy globalist elite. Satellite radar anomalies show deep subterranean tunnels stretching hundreds of miles into the Rocky Mountains where government scientists are reverse-engineering anti-gravity technology hidden from the public eye. Mainstream media refuses to report on the secret underground bunker system.",
            "label": "FAKE"
        },
        {
            "title": "Miracle Miracle Herb Cleanses All Arterial Plaque Overnight Doctors Terrified You Learn This",
            "text": "Big Pharma is scrambling to silence a heroic independent naturopath who revealed an ancient Himalayan root extract that melts 100% of cardiovascular plaque within eight hours of ingestion. Clinical trials conducted in secret European clinics proved that heart attacks and strokes are completely cured without surgery or prescription medications. Corrupt pharmaceutical executives are bribing government regulators to ban the plant so they can protect their billions in statin profits. Order before this page is banned by the medical mafia!",
            "label": "FAKE"
        },
        {
            "title": "UN Announces Global Microchip Mandate for All Citizens by Next Month in Secret Treaty",
            "text": "A leaked classified United Nations manifesto reveals a tyrannical plan to inject microscopic RFID tracking chips into every human on Earth by next month. The covert treaty, signed in secret by world leaders in Geneva, will eliminate all physical cash and require citizen biometric scans to purchase food or travel across state lines. Dissidents who refuse the mandatory digital chip implant will have their bank accounts instantly erased and will be relocated to containment zones. Share this urgent warning before the internet censors delete it!",
            "label": "FAKE"
        },
        {
            "title": "Pope Francis Arrested by Military Police at Vatican Following Shocking Raid",
            "text": "Breaking news that the corrupt fake news media is censoring: Italian military police and international special forces raided the Vatican at 3:00 AM this morning and placed Pope Francis under military arrest on treason and human trafficking charges. High-voltage blackout struck Rome as helicopters circled the papal palace. Vatican officials are frantically trying to conceal the dramatic raid, claiming the Pope is merely resting with a mild cold. Patriots across the world celebrate as justice finally arrives.",
            "label": "FAKE"
        },
        {
            "title": "Scientists Confirm 5G Cell Towers Are Broadcasting Mind-Control Frequencies to Subdue Citizens",
            "text": "A brave group of former military telecommunications engineers have come forward with undeniable laboratory evidence proving that fifth-generation cellular antennas are not for high-speed mobile data, but are weaponized electromagnetic emitters designed to alter neurological frequencies in the human brain. The pulsed microwave radiation causes lethargy, compliance, and depression, preventing citizens from questioning government decrees. Aluminum shielding is the only known defense against the government mind control array.",
            "label": "FAKE"
        },
        {
            "title": "Billionaire Tech Titan Admits Drinking Blood of Youth to Reverse Aging in Bizarre Live Video",
            "text": "In a horrifying live-stream that was quickly deleted by Silicon Valley platform administrators, a prominent social media billionaire confessed to undergoing monthly blood transfusions harvested from synthetic human pods in an undisclosed Caribbean facility. The billionaire claimed the esoteric ritual gave him superhuman vitality and extended cellular longevity. Insiders report that several tech executives and Hollywood elites are regular participants in the sinister life-extension cabal.",
            "label": "FAKE"
        },
        {
            "title": "Ancient 50-Foot Giant Skeletons Uncovered in Grand Canyon Covered Up by Smithsonian Museum",
            "text": "Construction workers excavating near a restricted canyon cliff in Arizona accidentally broke into a hidden cave cavern filled with dozens of mummified skeletons measuring between 40 and 50 feet in height. Smithsonian Institute agents immediately arrived in unmarked black helicopters, confiscated all photographs, and sealed off the perimeter with barbed wire. Historical researchers claim the discovery proves biblical giants once roamed America and the institutional academic cover-up has lasted over a century.",
            "label": "FAKE"
        },
        {
            "title": "Fluoride in Tap Water Confirmed to Be Chemical Pacification Weapon Deployed by Deep State",
            "text": "Declassified intelligence memos reveal that water fluoridation was never intended to prevent dental cavities, but was developed as a psychiatric placation agent to chemically lobotomize the populace. The compound calcifies the pineal gland, destroying spiritual awareness and making populations docile and obedient to centralized political commands. European nations banned fluoride decades ago after discovering its toxic behavioral suppression properties.",
            "label": "FAKE"
        }
    ]
    return pd.DataFrame(records)


def validate_and_clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates schema, cleans text, handles missing fields,
    normalizes labels, deduplicates, and validates class balance.
    """
    print("\n--- Validating & Cleaning Dataset ---")
    print(f"Initial raw record count: {len(df)}")
    print(f"Columns found: {list(df.columns)}")

    # Standardize column names (lowercase and stripped)
    df.columns = [c.strip().lower() for c in df.columns]

    # Check required columns
    required_cols = {"title", "text", "label"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Dataset missing required columns: {missing}. Found: {list(df.columns)}")

    # 1. Handle missing values
    initial_len = len(df)
    df = df.dropna(subset=["text", "label"]).copy()
    df["title"] = df["title"].fillna("").astype(str).str.strip()
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.strip()
    print(f"Dropped {initial_len - len(df)} rows with missing text or label.")

    # 2. Filter empty or trivial text
    # Body text must have at least 50 characters to be a meaningful news story
    df = df[df["text"].str.len() >= 50].copy()
    print(f"Records remaining after minimum length (>=50 chars) filter: {len(df)}")

    # 3. Normalize labels
    # George McIntire dataset labels are 'REAL' and 'FAKE'
    # Map 'REAL' / 0 -> 0 ('REAL'), 'FAKE' / 1 -> 1 ('FAKE')
    label_map = {
        "REAL": "REAL",
        "0": "REAL",
        "real": "REAL",
        "TRUE": "REAL",
        "true": "REAL",
        "FAKE": "FAKE",
        "1": "FAKE",
        "fake": "FAKE",
        "FALSE": "FAKE",
        "false": "FAKE"
    }

    df["label"] = df["label"].map(label_map)
    unrecognized = df["label"].isna().sum()
    if unrecognized > 0:
        print(f"Warning: Dropping {unrecognized} rows with unrecognized labels.")
        df = df.dropna(subset=["label"]).copy()

    # 4. Remove exact duplicates (prevent data leakage between train and test)
    # Combine title + text for deduplication check
    dupes = df.duplicated(subset=["title", "text"]).sum()
    if dupes > 0:
        print(f"Removing {dupes} exact duplicate records.")
        df = df.drop_duplicates(subset=["title", "text"]).copy()

    # 5. Build composite full_text: Title + "\n\n" + Text
    df["full_text"] = df.apply(
        lambda r: f"{r['title']}\n\n{r['text']}" if r['title'] else r['text'],
        axis=1
    )

    # 6. Check class balance
    class_counts = df["label"].value_counts().to_dict()
    total = len(df)
    print(f"Cleaned dataset size: {total} records")
    print("Class distribution:")
    for lbl, count in class_counts.items():
        pct = (count / total) * 100
        print(f"  - {lbl}: {count} ({pct:.2f}%)")

    # Guard against extreme class imbalance (e.g. < 5% minority)
    min_count = min(class_counts.values())
    if min_count / total < 0.10:
        print("Warning: Severe class imbalance detected (<10% minority). Stratified splitting recommended.")

    return df[["title", "text", "full_text", "label"]]


def generate_sample_articles():
    """Create curated illustrative sample articles for the UI testing and user evaluation."""
    samples = [
        {
            "id": "sample-1",
            "category": "Diplomacy & International News",
            "title": "Kerry to Go to Paris in Gesture of Sympathy Following Unity March",
            "text": "U.S. Secretary of State John F. Kerry said Monday that he will stop in Paris later this week, amid criticism that no top American officials attended Sunday's unity march against terrorism. Kerry said he expects to arrive in Paris Thursday evening, as he heads to an environmental conference in Sofia, Bulgaria. He will hold talks Friday with French President Francois Hollande, reaffirming the United States' solidarity with France and shared commitment to global counter-terrorism efforts.",
            "expected_label": "REAL",
            "source_type": "Mainstream Journalistic Reporting (Benchmark Example)"
        },
        {
            "id": "sample-2",
            "category": "Political Conspiracy Commentary",
            "title": "Unprecedented War with the FBI as Secret Cabal Collapses",
            "text": "Daniel Greenfield, a fellow focusing on political controversies, reports that in the final stretch of the election, powerful political elites have gone to war with the FBI. The word unprecedented has been thrown around so often that it is losing its meaning. Anonymous insiders claim federal agents are preparing emergency indictments against covert syndicates that mainstream outlets refuse to report. Share this warning before it is censored from social feeds.",
            "expected_label": "FAKE",
            "source_type": "Sensationalist Conspiratorial Editorial (Benchmark Example)"
        },
        {
            "id": "sample-3",
            "category": "Global Trade & Economic Policy",
            "title": "European Union Reaches Landmark Agreement on Comprehensive Artificial Intelligence Act",
            "text": "Negotiators from the European Parliament and the Council of the European Union finalized provisional rules governing artificial intelligence systems across the 27-nation bloc following three days of intense negotiations in Brussels. The regulation establishes a tiered risk framework that bans manipulative biometric surveillance in public spaces, mandates transparency requirements for high-impact foundation models, and institutes strict compliance assessments for healthcare and infrastructure algorithms. Internal Market Commissioner Thierry Breton declared the agreement a global benchmark for balancing technological innovation with fundamental democratic rights.",
            "expected_label": "REAL",
            "source_type": "Institutional European Union Reporting"
        },
        {
            "id": "sample-4",
            "category": "Health & Miracle Cure Hoax",
            "title": "Miracle Himalayan Root Melts 100% of Arterial Plaque Overnight, Doctors Terrified You Learn This",
            "text": "Big Pharma is scrambling to silence a heroic independent naturopath who revealed an ancient Himalayan root extract that melts 100% of cardiovascular plaque within eight hours of ingestion. Clinical trials conducted in secret European clinics proved that heart attacks and strokes are completely cured without surgery or prescription medications. Corrupt pharmaceutical executives are bribing government regulators to ban the plant so they can protect their billions in statin profits. Order before this page is banned by the medical mafia!",
            "expected_label": "FAKE",
            "source_type": "Clickbait Pseudo-Scientific Medical Hoax"
        }
    ]

    os.makedirs(os.path.dirname(SAMPLE_ARTICLES_JSON), exist_ok=True)
    with open(SAMPLE_ARTICLES_JSON, "w", encoding="utf-8") as f:
        json.dump(samples, f, indent=2)
    print(f"Saved {len(samples)} sample articles to {SAMPLE_ARTICLES_JSON}")


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Check if a raw dataset already exists or download
    try:
        raw_df = download_benchmark_dataset()
    except Exception as e:
        print(f"Notice: Remote download unsuccessful ({e}). Using curated fallback dataset.")
        raw_df = create_curated_fallback_dataset()

    clean_df = validate_and_clean_dataset(raw_df)
    
    clean_df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")
    print(f"Cleaned dataset successfully saved to: {OUTPUT_CSV}")
    
    generate_sample_articles()
    print("\nDataset preparation completed successfully!")


if __name__ == "__main__":
    main()
