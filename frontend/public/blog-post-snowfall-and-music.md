# 웹사이트에 눈송이 효과와 8비트 뮤직 플레이어 추가하기

개인 웹사이트의 메인 화면이 너무 밋밋하다는 생각이 들었다. 어떻게 하면 방문자에게 조금 더 특별한 경험을 줄 수 있을까 고민하다가, 두 가지 요소를 추가하기로 결정했다.

1. 은은하게 내리는 눈송이 효과
2. 대항해시대2 느낌의 8비트 배경음악

## 눈송이 효과 구현

Canvas API를 활용해서 배경에 눈이 내리는 효과를 만들었다. 핵심 포인트는 다음과 같다:

- 동그란 작은 원들로 눈송이를 표현
- 투명도 10~40%의 은은한 흰색
- 반지름 1~3px의 작은 크기
- 천천히 떨어지며 좌우로 살짝 흔들리는 자연스러운 움직임
- `pointer-events: none`으로 클릭에 방해되지 않도록 처리

```tsx
interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  drift: number;
}
```

화면 크기에 따라 눈송이 개수를 자동으로 조절하도록 했다. resize 이벤트를 감지해서 반응형으로 동작한다.

## 음악 플레이어 - 방향을 여러 번 바꾸다

처음에는 단순히 배경음악을 깔고 싶었다. 대항해시대2 OST의 "Mast in the Mist"와 "Wind Ahead" 같은 곡들이다.

### 1차 시도: 텍스트 기반 악보 포맷

저작권 문제로 원곡을 직접 사용할 수 없었다. 그래서 직접 악보를 작성할 수 있는 텍스트 포맷을 만들기로 했다.

```
BPM=120

[TRACK1]
NAME=멜로디
INST=square
VOL=0.6
C5/4 D5/4 E5/4 G5/4 E5/4 D5/4 C5/2
```

Tone.js를 사용해서 이 텍스트를 파싱하고 8비트 신디사이저로 연주하는 시스템을 구축했다. 멀티 트랙을 지원해서 멜로디, 베이스, 아르페지오를 동시에 연주할 수 있다.

비슷한 느낌의 오리지널 곡도 작곡해봤다:

- "Mist of the Sea" - 느리고 서정적인 곡
- "Voyage Ahead" - 빠르고 경쾌한 항해 음악

### 2차 시도: MIDI 파일 재생으로 전환

텍스트 포맷으로 악보를 작성하는 건 생각보다 번거로웠다. MIDI 파일을 직접 재생하면 어떨까?

`@tonejs/midi` 라이브러리를 발견했다. Tone.js와 완벽하게 호환되고, `.mid` 파일을 파싱해서 노트 정보를 추출할 수 있다.

```tsx
import { Midi } from "@tonejs/midi";

const midi = await Midi.fromUrl("/music/mast-in-mist.mid");

midi.tracks.forEach(track => {
  track.notes.forEach(note => {
    // note.name, note.duration, note.time 등
  });
});
```

기존 텍스트 파서를 삭제하고 MIDI 재생 방식으로 전환했다. 이제 MIDI 파일만 `public/music/` 폴더에 넣으면 된다.

### 사운드 개선: 필터 적용

8비트 사운드가 너무 날카로웠다. Low-pass 필터를 추가해서 고음역대를 깎아주니 훨씬 부드러워졌다.

```tsx
const filter = new Tone.Filter({
  frequency: 2000,
  type: "lowpass",
  rolloff: -12,
}).toDestination();
```

Envelope 설정도 조정했다:

- Attack: 0.02초 → 0.05초 (더 부드러운 시작)
- Release: 0.2초 → 0.4초 (더 긴 여운)

## 플레이어 UI 발전 과정

### 기본 기능

처음에는 재생/정지 버튼만 있었다.

### 플레이리스트 추가

여러 곡을 넣고 싶어서 이전/다음 버튼과 곡 목록 UI를 추가했다.

### 반복 모드

한 곡 반복과 전체 반복을 선택할 수 있게 했다. 설정은 localStorage에 저장된다.

### 볼륨 조절

볼륨 슬라이더를 추가하고, 역시 localStorage에 저장해서 다음 방문 시에도 유지되도록 했다.

### 곡 변경 시 자동 재생

처음에는 곡을 바꾸면 재생이 멈췄다. 재생 중이었으면 다음 곡도 자동으로 재생되도록 수정했다.

## 페이지 전환 시 음악 유지하기

가장 어려웠던 부분이다. 메인 페이지에서 다른 페이지로 이동하면 음악이 끊겼다.

### 해결 방법: Zustand + Layout

1. `MusicPlayerProvider` 컴포넌트를 만들어서 Tone.js 로직을 전역으로 관리
2. Zustand 스토어로 재생 상태, 현재 곡, 볼륨 등을 관리
3. `layout.tsx`에서 Provider와 MusicPlayer를 렌더링

```tsx
<MusicPlayerProvider>
  {children}
  <MusicPlayer />
</MusicPlayerProvider>
```

### 정적 사이트의 한계

Next.js의 정적 내보내기(static export) 환경에서는 페이지 전환 시 전체가 새로 로드될 수 있다. 이를 위해 재생 상태를 localStorage에 저장하고 복원하는 로직을 추가했다.

```tsx
interface PlaybackState {
  currentSongIndex: number;
  isPlaying: boolean;
  timestamp: number;
}
```

5분 이내에 저장된 상태라면 페이지 로드 시 자동으로 복원한다.

## 최종 구조

```
components/
  ├── Snowfall.tsx          # 눈송이 효과
  ├── MusicPlayerProvider.tsx  # 전역 음악 상태 관리
  └── MusicPlayer.tsx          # 플레이어 UI

public/music/
  ├── mast-in-mist.mid
  └── wind-ahead.mid
```

## 배운 점

1. **작게 시작해서 점진적으로 발전시키기** - 처음부터 완벽한 설계를 하려 하지 않았다. 필요에 따라 방향을 바꿨다.

2. **라이브러리 선택의 중요성** - Tone.js와 @tonejs/midi 조합이 웹 오디오 작업에 매우 편리했다.

3. **사용자 경험 고려** - 날카로운 소리를 필터로 부드럽게, 페이지 전환에도 음악이 유지되도록.

4. **브라우저 제약 이해** - 오토플레이 정책, 정적 사이트의 한계 등을 고려해야 했다.

이제 웹사이트에 들어가면 은은하게 눈이 내리고, 8비트 음악이 흐른다. 작은 변화지만 분위기가 확 달라졌다.
