export default function BlueIronRevivalSerialDecoder() {
  const { useMemo, useState } = React;

  type RangeRow = {
    make: string;
    family: string;
    model: string;
    year: number;
    serialStart: number;
    serialEnd: number;
    notes?: string;
  };

  // Demo data only.
  // Replace these rows with verified production serial tables before publishing.
  const SERIAL_DATA: RangeRow[] = [
    {
      make: "Ford",
      family: "NAA / Golden Jubilee",
      model: "NAA",
      year: 1953,
      serialStart: 1,
      serialEnd: 77474,
      notes: "Demo row only — verify against your source tables.",
    },
    {
      make: "Ford",
      family: "NAA / Golden Jubilee",
      model: "NAA",
      year: 1954,
      serialStart: 77475,
      serialEnd: 128965,
      notes: "Demo row only — verify against your source tables.",
    },
    {
      make: "Ford",
      family: "01 Series",
      model: "641 Workmaster",
      year: 1958,
      serialStart: 1000,
      serialEnd: 18000,
      notes: "Placeholder example — replace with verified ranges.",
    },
    {
      make: "Ford",
      family: "01 Series",
      model: "641 Workmaster",
      year: 1959,
      serialStart: 18001,
      serialEnd: 42000,
      notes: "Placeholder example — replace with verified ranges.",
    },
    {
      make: "Ford",
      family: "Thousands / 3-Cylinder",
      model: "2000",
      year: 1965,
      serialStart: 100001,
      serialEnd: 125000,
      notes: "Placeholder example — replace with verified ranges.",
    },
    {
      make: "Ford",
      family: "Thousands / 3-Cylinder",
      model: "2000",
      year: 1966,
      serialStart: 125001,
      serialEnd: 150000,
      notes: "Placeholder example — replace with verified ranges.",
    },
    {
      make: "Ford",
      family: "Thousands / 3-Cylinder",
      model: "2000",
      year: 1967,
      serialStart: 150001,
      serialEnd: 175000,
      notes: "Placeholder example — replace with verified ranges.",
    },
  ];

  const [rawInput, setRawInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function normalizeSerial(value: string) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function extractNumericPortion(value: string) {
    const match = value.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  }

  const cleanedInput = useMemo(() => normalizeSerial(rawInput), [rawInput]);
  const numericSerial = useMemo(() => extractNumericPortion(cleanedInput), [cleanedInput]);

  const matches = useMemo(() => {
    if (!submitted || numericSerial === null) return [] as RangeRow[];

    return SERIAL_DATA.filter(
      (row) => numericSerial >= row.serialStart && numericSerial <= row.serialEnd
    ).sort((a, b) => a.year - b.year);
  }, [submitted, numericSerial]);

  const hasInput = cleanedInput.length > 0;
  const invalidInput = submitted && (!hasInput || numericSerial === null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium tracking-wide uppercase text-slate-600">
              Blue Iron Revival
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ford Tractor Serial Decoder
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-600 max-w-3xl">
                Enter a tractor serial number to estimate the likely year and model range.
                This prototype is built for Blue Iron Revival and is ready to be wired to
                verified Ford serial-number reference data.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="serial" className="block text-sm font-semibold text-slate-800 mb-2">
                  Serial number
                </label>
                <input
                  id="serial"
                  value={rawInput}
                  onChange={(e) => {
                    setRawInput(e.target.value);
                    if (submitted) setSubmitted(false);
                  }}
                  placeholder="Example: 12345 or C12345"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-300"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Input is normalized automatically. Spaces, dashes, and punctuation are removed.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-2xl px-5 py-3 bg-slate-900 text-white font-medium shadow-sm hover:opacity-95"
                >
                  Decode serial number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRawInput("");
                    setSubmitted(false);
                  }}
                  className="rounded-2xl px-5 py-3 border border-slate-300 bg-white font-medium hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Normalized input</div>
                  <div className="font-semibold mt-1">{cleanedInput || "—"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Numeric portion used for lookup</div>
                  <div className="font-semibold mt-1">{numericSerial ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">How this should work in production</h2>
            <ol className="mt-3 space-y-3 text-sm text-slate-600 list-decimal pl-5">
              <li>Normalize the submitted serial number.</li>
              <li>Match it against verified serial ranges by year and model.</li>
              <li>Return the most likely result, plus confidence notes.</li>
              <li>Flag overlap or ambiguity where Ford reused patterns.</li>
            </ol>
            <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
              The current lookup rows are sample/demo data only. Replace them before public use.
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Results</h2>

          {!submitted && (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500">
              Enter a serial number and run the lookup.
            </div>
          )}

          {invalidInput && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
              Enter a serial number containing at least one number so the tool can perform a lookup.
            </div>
          )}

          {submitted && !invalidInput && matches.length === 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              No matching range was found in the current dataset. That usually means the serial
              range table needs more coverage, or the tractor should also be identified using model
              and unit codes rather than serial alone.
            </div>
          )}

          {submitted && !invalidInput && matches.length > 0 && (
            <div className="mt-4 grid gap-4">
              {matches.map((row, idx) => (
                <div key={`${row.model}-${row.year}-${idx}`} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-500">Likely match</div>
                      <div className="text-2xl font-bold mt-1">
                        {row.make} {row.model}
                      </div>
                      <div className="mt-1 text-slate-600">{row.family}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-3 min-w-[140px] text-center">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Estimated year</div>
                      <div className="text-2xl font-bold mt-1">{row.year}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <div className="text-slate-500">Matched serial range</div>
                      <div className="font-semibold mt-1">
                        {row.serialStart.toLocaleString()}–{row.serialEnd.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <div className="text-slate-500">Submitted serial</div>
                      <div className="font-semibold mt-1">{cleanedInput}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <div className="text-slate-500">Numeric lookup value</div>
                      <div className="font-semibold mt-1">{numericSerial?.toLocaleString()}</div>
                    </div>
                  </div>

                  {row.notes && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <span className="font-semibold">Notes:</span> {row.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Next build steps</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold">1. Load real data</div>
              <p className="mt-2 text-slate-600">
                Replace the demo rows with verified serial-number tables for Ford tractor families.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold">2. Add model/unit code decoding</div>
              <p className="mt-2 text-slate-600">
                Many tractors are identified more accurately by serial, model code, and unit/date code together.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold">3. Publish it</div>
              <p className="mt-2 text-slate-600">
                This can be deployed as a simple static site on Vercel, Netlify, or GitLab Pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
