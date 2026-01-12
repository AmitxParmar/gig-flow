import * as React from "react";

/**
 * A custom hook that tracks the state of a media query.
 *
 * @param query - The media query string to match against (e.g., "(max-width: 768px)").
 * @returns A boolean indicating whether the media query currently matches.
 */
export function useMediaQuery(query: string) {
    const [value, setValue] = React.useState(false);

    React.useEffect(() => {
        function onChange(event: MediaQueryListEvent) {
            setValue(event.matches);
        }

        const result = matchMedia(query);
        result.addEventListener("change", onChange);
        setValue(result.matches);

        return () => result.removeEventListener("change", onChange);
    }, [query]);

    return value;
}
