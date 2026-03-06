(function () {
  function normalizeSerial(input) {
    const cleaned = String(input || "")
      .toUpperCase()
      .trim()
      .replace(/[★☆*◇◊<>]/g, "")
      .replace(/[^A-Z0-9]/g, "");

    const splitMatch = cleaned.match(/^(.*?)(\d+)$/);

    if (!splitMatch) {
      return {
        raw: cleaned,
        prefix: "",
        number: null
      };
    }

    return {
      raw: cleaned,
      prefix: splitMatch[1] || "",
      number: parseInt(splitMatch[2], 10)
    };
  }

  function familyAliases(selectedFamily) {
    const map = {
      "N Series": ["N SERIES", "9N", "2N", "8N"],
      "9N": ["9N"],
      "2N": ["2N"],
      "8N": ["8N"],
      "NAA/Jubilee": ["NAA", "JUBILEE", "GOLDEN JUBILEE", "NAA/JUBILEE"],
      "Hundred Series": ["HUNDRED", "600", "700", "800", "900", "HUNDRED SERIES"],
      "01 Series": ["01", "601", "701", "801", "901", "01 SERIES"],
      "Thousand 4-cyl": ["THOUSAND 4-CYL", "THOUSAND 4 CYL", "4-CYL", "4 CYL", "2000", "4000"],
      "Thousand 3-cyl": ["THOUSAND 3-CYL", "THOUSAND 3 CYL", "3-CYL", "3 CYL", "2000", "3000", "4000", "5000"],
      "x600 Series": ["X600", "2600", "3600", "4600", "5600", "6600", "7600"]
    };

    return map[selectedFamily] || [selectedFamily];
  }

  function valueContainsAlias(value, aliases) {
    const normalizedValue = String(value || "").toUpperCase();
    return aliases.some(alias => normalizedValue.includes(String(alias).toUpperCase()));
  }

  function familyMatchesRow(selectedFamily, row) {
    if (!selectedFamily) return true;

    const aliases = familyAliases(selectedFamily);
    const rowFamily = String(row.model_family || "");
    const rowEra = String(row.era || "");
    const rowModel = String(row.model || "");
    const rowNotes = String(row.notes || "");

    return (
      valueContainsAlias(rowFamily, aliases) ||
      valueContainsAlias(rowEra, aliases) ||
      valueContainsAlias(rowModel, aliases) ||
      valueContainsAlias(rowNotes, aliases)
    );
  }

  function rowPrefixMatches(normalized, row) {
    const rowPrefix = String(row.serial_prefix || "").toUpperCase();

    if (rowPrefix === "") {
      return normalized.prefix === "";
    }

    return normalized.prefix === rowPrefix;
  }

  function rowNumberMatches(normalized, row) {
    if (normalized.number === null || Number.isNaN(normalized.number)) {
      return false;
    }

    const start = Number(row.serial_start_num);
    const end = Number(row.serial_end_num);

    if (Number.isNaN(start) || Number.isNaN(end)) {
      return false;
    }

    return normalized.number >= start && normalized.number <= end;
  }

  function scoreRow(normalized, selectedFamily, row) {
    let score = 0;

    if (familyMatchesRow(selectedFamily, row)) score += 100;
    if (rowPrefixMatches(normalized, row)) score += 50;
    if (rowNumberMatches(normalized, row)) score += 200;

    if (selectedFamily === "2N" && normalized.prefix === "9N") score += 25;
    if (selectedFamily === "N Series" && String(row.model_family || "").toUpperCase() === "2N" && normalized.prefix === "9N") score += 10;

    return score;
  }

  function findFordSerialMatch(input, selectedFamily, data) {
    if (!Array.isArray(data) || !data.length) {
      return null;
    }

    const normalized = normalizeSerial(input);

    if (!normalized.raw || normalized.number === null) {
      return null;
    }

    const candidates = data.filter(row => {
      if (!familyMatchesRow(selectedFamily, row)) return false;
      if (!rowPrefixMatches(normalized, row)) return false;
      if (!rowNumberMatches(normalized, row)) return false;
      return true;
    });

    if (!candidates.length) {
      return null;
    }

    candidates.sort((a, b) => {
      const scoreA = scoreRow(normalized, selectedFamily, a);
      const scoreB = scoreRow(normalized, selectedFamily, b);

      if (scoreB !== scoreA) return scoreB - scoreA;

      const yearA = Number(a.year || 0);
      const yearB = Number(b.year || 0);
      if (yearA !== yearB) return yearA - yearB;

      const startA = Number(a.serial_start_num || 0);
      const startB = Number(b.serial_start_num || 0);
      return startA - startB;
    });

    const row = candidates[0];

    return {
      ...row,
      original_input: input,
      normalized_serial: normalized.raw,
      display_family: row.model_family || row.era || selectedFamily || "Ford Tractor",
      display_year: row.year
    };
  }

  function formatFordLookupResult(match) {
    if (!match) return null;

    const notes = [
      `Matched serial range: ${match.serial_start_raw} to ${match.serial_end_raw}`
    ];

    if (match.era) notes.push(`Era: ${match.era}`);
    if (match.model_family) notes.push(`Dataset family: ${match.model_family}`);
    if (match.serial_prefix) {
      notes.push(`Expected serial prefix: ${match.serial_prefix}`);
    } else {
      notes.push("Expected serial prefix: numeric serial only");
    }

    return {
      title: `${match.display_family} serial number match`,
      message: `This serial number most likely falls in the ${match.display_year} production year.`,
      notes
    };
  }

  window.normalizeSerial = normalizeSerial;
  window.findFordSerialMatch = findFordSerialMatch;
  window.formatFordLookupResult = formatFordLookupResult;
})();